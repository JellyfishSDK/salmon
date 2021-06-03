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
    private readonly broadcastHex: (hex: string) => Promise<void>,
    private readonly ellipticPair: EllipticPair,
    feeRate: FeeRateProvider,
    prevout: PrevoutProvider
  ) {
    this.builder = new P2WPKHTransactionBuilder(feeRate, prevout, {
      get: (_) => ellipticPair
    })
  }

  async updatePrices (oracleId: string, token: string, prices: TokenAmount[]): Promise<void> {
    const transaction: TransactionSegWit = await this.builder.oracles.setOracleData({
      oracleId: oracleId,
      timestamp: new BigNumber(Date.now()),
      tokens: [
        {
          token: token,
          prices: prices
        }
      ]
    }, await this.getChangeScript())
    await this.broadcast(transaction)
  }

  private async broadcast (transaction: TransactionSegWit): Promise<void> {
    const buffer = new SmartBuffer()
    new CTransactionSegWit(transaction).toBuffer(buffer)
    const hex = buffer.toBuffer().toString('hex')
    await this.broadcastHex(hex)
  }

  private async getChangeScript (): Promise<Script> {
    return {
      stack: [
        OP_CODES.OP_0,
        OP_CODES.OP_PUSHDATA(HASH160(await this.ellipticPair.publicKey()), 'little')
      ]
    }
  }
}
