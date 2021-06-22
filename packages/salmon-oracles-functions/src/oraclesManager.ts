import {
  FeeRateProvider,
  P2WPKHTransactionBuilder,
  PrevoutProvider
} from '@defichain/jellyfish-transaction-builder'
import { SmartBuffer } from 'smart-buffer'
import { EllipticPair, WIF } from '@defichain/jellyfish-crypto'
import { CTransactionSegWit, OP_CODES, Script, TransactionSegWit } from '@defichain/jellyfish-transaction'
import { TokenPrice } from '@defichain/jellyfish-transaction/dist/script/defi/dftx_price'
import { HASH160 } from '@defichain/jellyfish-crypto/dist/hash'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { WhaleWalletAccount, WhalePrevoutProvider, WhaleFeeRateProvider } from '@defichain/whale-api-wallet'
import { getNetwork, NetworkName } from '@defichain/jellyfish-network'
import { SalmonWalletHDNode } from './salmonWalletHDNode'
import BigNumber from 'bignumber.js'

export class OraclesManager {
  private readonly builder: P2WPKHTransactionBuilder

  constructor (
    private readonly broadcastHex: (hex: string) => Promise<string>,
    private readonly ellipticPair: EllipticPair,
    feeRate: FeeRateProvider,
    prevout: PrevoutProvider
  ) {
    this.builder = new P2WPKHTransactionBuilder(feeRate, prevout, {
      get: (_) => ellipticPair
    })
  }

  /**
   * Pushes prices to the price oracle on the blockchain.
   *
   * @param {string} oracleId
   * @param {string} token
   * @param {TokenPrice[]} tokenPrices
   * @param {BigNumber} [timestamp = new BigNumber(Math.floor(Date.now() / 1000))]
   * @return {Promise<void>}
   */
  async updatePrices (
    oracleId: string,
    tokenPrices: TokenPrice[],
    timestamp: BigNumber = new BigNumber(Math.floor(Date.now() / 1000))
  ): Promise<void> {
    const txnData = {
      oracleId,
      timestamp,
      tokens: tokenPrices
    }

    const transaction: TransactionSegWit = await this.builder.oracles.setOracleData(txnData, await this.getChangeScript())
    await this.broadcast(transaction)
  }

  private async broadcast (transaction: TransactionSegWit): Promise<string> {
    const buffer = new SmartBuffer()
    new CTransactionSegWit(transaction).toBuffer(buffer)
    const hex = buffer.toBuffer().toString('hex')
    return await this.broadcastHex(hex)
  }

  /**
   * Returns the script for the price oracle owner.
   *
   * @return {Promise<Script>}
   */
  public async getChangeScript (): Promise<Script> {
    return {
      stack: [
        OP_CODES.OP_0,
        OP_CODES.OP_PUSHDATA(HASH160(await this.ellipticPair.publicKey()), 'little')
      ]
    }
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
      url
    })

    const ellipticPair = WIF.asEllipticPair(privKey)
    const hdNode = new SalmonWalletHDNode(ellipticPair)
    const walletAccount = new WhaleWalletAccount(whaleClient, hdNode,
      getNetwork(network as NetworkName))

    const prevout = new WhalePrevoutProvider(walletAccount, 10)
    const feeRate = new WhaleFeeRateProvider(whaleClient)

    return new OraclesManager(
      async (hex: string) => {
        return await whaleClient.transactions.send({ hex })
      },
      ellipticPair,
      feeRate,
      prevout
    )
  }
}
