import { Bech32, Elliptic, EllipticPair, dSHA256, HASH160 } from '@defichain/jellyfish-crypto'
import { MasterNodeRegTestContainer } from '@defichain/testcontainers'
import { CTransaction, CTransactionSegWit, OP_CODES, Script, Transaction, TransactionSegWit } from '@defichain/jellyfish-transaction'
import { SmartBuffer } from 'smart-buffer'

/**
 * For test mocking only, obviously not secured.
 */
export function randomEllipticPair (): EllipticPair {
  return Elliptic.fromPrivKey(Buffer.alloc(32, Math.random().toString(), 'ascii'))
}

/**
 * Fund bech32 address
 */
export async function fundEllipticPair (container: MasterNodeRegTestContainer, ellipticPair: EllipticPair, amount: number): Promise<void> {
  const pubKey = await ellipticPair.publicKey()
  const address = Bech32.fromPubKey(pubKey, 'bcrt')

  await container.fundAddress(address, amount)
  await container.generate(1)
}

export async function getChangeScript (ellipticPair: EllipticPair): Promise<Script> {
  return {
    stack: [
      OP_CODES.OP_0,
      OP_CODES.OP_PUSHDATA(HASH160(await ellipticPair.publicKey()), 'little')
    ]
  }
}

export async function sendTransaction (container: MasterNodeRegTestContainer, transaction: TransactionSegWit): Promise<TxOut[]> {
  const buffer = new SmartBuffer()
  new CTransactionSegWit(transaction).toBuffer(buffer)
  const hex = buffer.toBuffer().toString('hex')
  const txid = await container.call('sendrawtransaction', [hex])
  await container.generate(1)

  const tx = await container.call('getrawtransaction', [txid, true])
  return tx.vout as TxOut[]
}

export function calculateTxid (transaction: Transaction): string {
  const buffer = new SmartBuffer()
  new CTransaction(transaction).toBuffer(buffer)
  return dSHA256(buffer.toBuffer()).reverse().toString('hex')
}

export interface TxOut {
  value: number
  n: number
  scriptPubKey: {
    asm: string
    hex: string
    type: string
    addresses: string[]
  }
  tokenId: number
}
