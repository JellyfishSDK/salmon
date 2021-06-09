import {
  FeeRateProvider,
  P2WPKHTransactionBuilder,
  PrevoutProvider
} from '@defichain/jellyfish-transaction-builder'
import { SmartBuffer } from 'smart-buffer'
import { EllipticPair } from '@defichain/jellyfish-crypto'
import { CTransactionSegWit, OP_CODES, Script, TransactionSegWit } from '@defichain/jellyfish-transaction'
import { TokenAmount } from '@defichain/jellyfish-transaction/dist/script/defi/dftx_price'
import BigNumber from 'bignumber.js'
import { HASH160 } from '@defichain/jellyfish-crypto/dist/hash'

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
   * @param {string} string
   * @param {TokenAmount[]} prices
   * @return {Promise<void>}
   */
  async updatePrices (oracleId: string, token: string, prices: TokenAmount[]): Promise<void> {
    const txnData = {
      oracleId: oracleId,
      timestamp: new BigNumber(Math.floor(Date.now() / 1000)),
      tokens: [
        {
          token: token,
          prices: prices
        }
      ]
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
}
