import { P2WPKHTransactionBuilder } from '@defichain/jellyfish-transaction-builder'
import { SmartBuffer } from 'smart-buffer'
import { HASH160, WIF } from '@defichain/jellyfish-crypto'
import { CTransactionSegWit, OP_CODES, Script, TokenPrice, TransactionSegWit } from '@defichain/jellyfish-transaction'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { getNetwork, NetworkName } from '@defichain/jellyfish-network'
import { SalmonWalletHDNode } from './salmonWalletHDNode'
import BigNumber from 'bignumber.js'

export class OraclesManager {
  constructor (
    private readonly broadcastHex: (hex: string) => Promise<string>,
    private readonly builder: P2WPKHTransactionBuilder
  ) {
  }

  private async broadcast (transaction: TransactionSegWit): Promise<string> {
    const buffer = new SmartBuffer()
    new CTransactionSegWit(transaction).toBuffer(buffer)
    const hex = buffer.toString('hex')
    return await this.broadcastHex(hex)
  }

  /**
   * Returns the script for the price oracle owner.
   *
   * @return {Promise<Script>}
   */
  public async getChangeScript (): Promise<Script> {
    const ellipticPair =
      this.builder.ellipticPairProvider.get({
        txid: '',
        vout: 0,
        tokenId: 0,
        script: { stack: [] },
        value: new BigNumber(0)
      })

    return {
      stack: [
        OP_CODES.OP_0,
        OP_CODES.OP_PUSHDATA(HASH160(await ellipticPair.publicKey()), 'little')
      ]
    }
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

    const transaction: TransactionSegWit = await this.builder.oracles.setOracleData(txnData, await this.getChangeScript())
    return await this.broadcast(transaction)
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
    const hdNode = new SalmonWalletHDNode(ellipticPair)
    const walletAccount = new WhaleWalletAccount(whaleClient, hdNode,
      getNetwork(network as NetworkName))

    return new OraclesManager(
      async (hex: string) => {
        return await whaleClient.transactions.send({ hex })
      },
      walletAccount.withTransactionBuilder()
    )
  }
}
