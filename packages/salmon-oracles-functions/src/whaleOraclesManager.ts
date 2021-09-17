import { P2WPKHTransactionBuilder } from '@defichain/jellyfish-transaction-builder'
import { WIF } from '@defichain/jellyfish-crypto'
import { TokenPrice } from '@defichain/jellyfish-transaction'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { getNetwork, NetworkName } from '@defichain/jellyfish-network'
import BigNumber from 'bignumber.js'
import { WalletAccount } from '@defichain/jellyfish-wallet'
import { WalletClassic } from '@defichain/jellyfish-wallet-classic'
import { OraclesManager } from './oraclesManager'
import { OraclePriceFeed } from '@defichain/whale-api-client/dist/api/oracles'

export class WhaleOraclesManager extends OraclesManager {
  constructor (
    broadcastHex: (rawTx: { hex: string }) => Promise<string>,
    builder: P2WPKHTransactionBuilder,
    walletAccount: WalletAccount,
    public readonly whaleClient: WhaleApiClient
  ) {
    super(broadcastHex, builder, walletAccount)
  }

  /**
   * Fetches the existing price oracle prices and filters out prices that are identical to
   * the existing price
   *
   * @param {TokenPrice[]} tokenPrices
   * @param {Record<string, OraclePriceFeed>} existing
   * @param {(tokenPrice: TokenPrice) => Promise<void>} onCircuitBreak
   * @param {number} closeThreshold
   * @param {number} farThreshold
   * @returns {TokenPrice[]}
   */
  async filterAgainstExistingPrices (tokenPrices: TokenPrice[], existing: Record<string, OraclePriceFeed>,
    onCircuitBreak: (tokenPrice: TokenPrice, existing: OraclePriceFeed) => Promise<void>, closeThreshold: number,
    farThreshold: number): Promise<TokenPrice[]> {
    const filteredTokenPrices = []
    for (const tokenPrice of tokenPrices) {
      const existingPrice = existing[`${tokenPrice.token}-${tokenPrice.prices[0].currency}`]

      if (existingPrice !== undefined) {
        const existingAmount = new BigNumber(existingPrice.amount)
        const newAmount = new BigNumber(tokenPrice.prices[0].amount)
        const isEqual = existingAmount.eq(newAmount)
        if (isEqual) {
          continue
        }

        const ONE_HOUR = 60 * 60
        const timeNow = Date.now() / 1000
        const threshold = (timeNow - existingPrice.block.medianTime) < ONE_HOUR ? closeThreshold : farThreshold
        if (newAmount.minus(existingAmount).abs().gt(existingAmount.times(threshold))) {
          await onCircuitBreak(tokenPrice, existingPrice)
          continue
        }
      }

      filteredTokenPrices.push(tokenPrice)
    }

    return filteredTokenPrices
  }

  /**
   * Fetches the existing price oracle prices
   *
   * @param {OraclePriceFeed[]} oraclePrices
   * @param {WhaleApiClient} whaleClient
   * @param {string} oracleId
   * @returns {Promise<Record<string, TokenPrice>>}
   */
  async listExistingOraclePrices (tokenPrices: TokenPrice[], oracleId: string): Promise<Record<string, OraclePriceFeed>> {
    const existingTokenPrices: Record<string, OraclePriceFeed> = {}
    for (const tokenPrice of tokenPrices) {
      const existing = await this.whaleClient.oracles.getPriceFeed(oracleId, tokenPrice.token,
        tokenPrice.prices[0].currency, 1)

      if (existing.length !== 0) {
        existingTokenPrices[`${tokenPrice.token}-${tokenPrice.prices[0].currency}`] = existing[0]
      }
    }

    return existingTokenPrices
  }

  /**
   * Creates an oracles manager with a whale api client.
   *
   * @param {string} url
   * @param {string} network
   * @param {string} privKey
   * @return {WhaleOraclesManager}
   */
  static withWhaleClient (
    url: string,
    network: string,
    privKey: string
  ): WhaleOraclesManager {
    const whaleClient = new WhaleApiClient({
      url,
      network,
      version: 'v0'
    })

    const hdNode = new WalletClassic(WIF.asEllipticPair(privKey))
    const walletAccount = new WhaleWalletAccount(whaleClient, hdNode,
      getNetwork(network as NetworkName))

    return new WhaleOraclesManager(
      async (rawTx: { hex: string }): Promise<string> =>
        await whaleClient.rawtx.send(rawTx),
      walletAccount.withTransactionBuilder(),
      walletAccount,
      whaleClient
    )
  }
}
