import { EllipticPair } from '@defichain/jellyfish-crypto'
import { SIGHASH, Transaction, TransactionSegWit, Vout } from '@defichain/jellyfish-transaction'
import { WalletHdNode } from '@defichain/jellyfish-wallet'
import { SignInputOption, TransactionSigner } from '@defichain/jellyfish-transaction-signature'

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
    return await this.ellipticPair.privateKey()
  }

  async sign (hash: Buffer): Promise<Buffer> {
    return await this.ellipticPair.sign(hash)
  }

  async verify (hash: Buffer, derSignature: Buffer): Promise<boolean> {
    return await this.ellipticPair.verify(hash, derSignature)
  }

  async signTx (transaction: Transaction, prevouts: Vout[]): Promise<TransactionSegWit> {
    const inputs: SignInputOption[] = prevouts.map(prevout => {
      return { prevout: prevout, ellipticPair: this }
    })
    return TransactionSigner.sign(transaction, inputs, {
      sigHashType: SIGHASH.ALL
    })
  }
}
