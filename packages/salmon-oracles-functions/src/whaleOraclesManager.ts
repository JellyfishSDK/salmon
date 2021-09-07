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
   * @param {WhaleApiClient} whaleClient
   * @param {string} oracleId
   * @returns {Promise<TokenPrice[]>}
   */
  async filterAgainstExistingPrices (tokenPrices: TokenPrice[], oracleId: string): Promise<TokenPrice[]> {
    const filteredTokenPrices = []
    for (const tokenPrice of tokenPrices) {
      const existing = await this.whaleClient.oracles.getPriceFeed(oracleId, tokenPrice.token,
        tokenPrice.prices[0].currency, 1)

      if (existing.length === 0) {
        filteredTokenPrices.push(tokenPrice)
      } else {
        const isEqual = new BigNumber(existing[0].amount).eq(tokenPrice.prices[0].amount)
        if (!isEqual) {
          filteredTokenPrices.push(tokenPrice)
        }
      }
    }

    return filteredTokenPrices
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
