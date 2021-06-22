import { EllipticPair } from '@defichain/jellyfish-crypto'
import { Transaction, TransactionSegWit, Vout } from '@defichain/jellyfish-transaction'
import { WalletHdNode } from '@defichain/jellyfish-wallet'

/**
 * Single elliptic pair wallet HD node.
 */
export class SalmonWalletHDNode implements WalletHdNode {
  constructor (
    private readonly ellipticPair: EllipticPair
  ) {
  }

  async publicKey (): Promise<Buffer> {
    return await this.ellipticPair.publicKey()
  }

  async privateKey (): Promise<Buffer> {
    throw new Error('Attempting to retrieve private key')
  }

  async sign (hash: Buffer): Promise<Buffer> {
    throw new Error('Attempting to sign')
  }

  async verify (hash: Buffer, derSignature: Buffer): Promise<boolean> {
    return await this.ellipticPair.verify(hash, derSignature)
  }

  async signTx (transaction: Transaction, prevouts: Vout[]): Promise<TransactionSegWit> {
    throw new Error('Attempting to signTx')
  }
}
