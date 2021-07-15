import { P2WPKHTransactionBuilder } from '@defichain/jellyfish-transaction-builder'
import { Bech32, WIF } from '@defichain/jellyfish-crypto'
import { CTransactionSegWit, Script, TokenPrice, TransactionSegWit } from '@defichain/jellyfish-transaction'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { getNetwork, NetworkName } from '@defichain/jellyfish-network'
import BigNumber from 'bignumber.js'
import { WalletAccount } from '@defichain/jellyfish-wallet'
import { WalletClassic } from '@defichain/jellyfish-wallet-classic'

export class OraclesManager {
  constructor (
    private readonly broadcastHex: (hex: string) => Promise<string>,
    private readonly builder: P2WPKHTransactionBuilder,
    private readonly walletAccount: WalletAccount
  ) {
  }

  /**
   * Returns the script for the price oracle owner.
   *
   * @return {Promise<Script>}
   */
  public async getChangeScript (): Promise<Script> {
    return await this.walletAccount.getScript()
  }

  /**
   * Returns the address for the price oracle owner.
   *
   * @return {Promise<string>}
   */
  public async getAddress (): Promise<string> {
    const pubKey = await this.walletAccount.publicKey()
    return Bech32.fromPubKey(pubKey, 'df')
  }

  /**
   * Returns the balance for the address for the price oracle owner.
   *
   * @param {string} url
   * @param {string} network
   * @return {Promise<string>}
   */
  public async getBalance (url: string, network: string): Promise<BigNumber> {
    const whaleClient = new WhaleApiClient({
      url,
      network
    })

    return new BigNumber(await whaleClient.address.getBalance(await this.getAddress()))
  }

  /**
   * Pushes prices to the price oracle on the blockchain.
   *
   * @param {string} oracleId
   * @param {string} token
   * @param {TokenPrice[]} tokenPrices
   * @param {BigNumber} [timestamp = new BigNumber(Math.floor(Date.now() / 1000))]
   * @return {Promise<string|undefined>}
   */
  async updatePrices (
    oracleId: string,
    tokenPrices: TokenPrice[],
    timestamp: BigNumber = new BigNumber(Math.floor(Date.now() / 1000))
  ): Promise<string | undefined> {
    if (tokenPrices.length === 0) {
      return
    }

    const txnData = {
      oracleId,
      timestamp,
      tokens: tokenPrices
    }

    const setOracleDataTxn: TransactionSegWit = await this.builder.oracles.setOracleData(txnData, await this.getChangeScript())
    const transactionSegWit: CTransactionSegWit = new CTransactionSegWit(setOracleDataTxn)
    return await this.broadcastHex(transactionSegWit.toHex())
  }

  /**
   * Creates an oracles manager with a whale api client.
   *
   * @param {string} url
   * @param {string} network
   * @param {string} privKey
   * @return {OraclesManager}
   */
  static withWhaleClient (
    url: string,
    network: string,
    privKey: string
  ): OraclesManager {
    const whaleClient = new WhaleApiClient({
      url,
      network
    })

    const ellipticPair = WIF.asEllipticPair(privKey)
    const hdNode = new WalletClassic(ellipticPair)
    const walletAccount = new WhaleWalletAccount(whaleClient, hdNode,
      getNetwork(network as NetworkName))

    return new OraclesManager(
      async (hex: string) => {
        return await whaleClient.transactions.send({ hex })
      },
      walletAccount.withTransactionBuilder(),
      walletAccount
    )
  }
}
