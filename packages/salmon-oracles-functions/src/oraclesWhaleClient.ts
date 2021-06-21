import { EllipticPair, WIF } from '@defichain/jellyfish-crypto'
import { Transaction, TransactionSegWit, Vout } from '@defichain/jellyfish-transaction'
import { OraclesManager } from './oraclesManager'
import { WalletHdNode } from '@defichain/jellyfish-wallet'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { WhaleWalletAccount, WhalePrevoutProvider, WhaleFeeRateProvider } from '@defichain/whale-api-wallet'
import { getNetwork, NetworkName } from '@defichain/jellyfish-network'

class SalmonWalletHDNode implements WalletHdNode {
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

export class OraclesWhaleClient {
  public readonly oraclesManager: OraclesManager
  private readonly whaleClient: WhaleApiClient
  private readonly walletAccount: WhaleWalletAccount

  constructor (
    url: string,
    network: string,
    privKey: string
  ) {
    this.whaleClient = new WhaleApiClient({
      url
    })

    const ellipticPair = WIF.asEllipticPair(privKey)
    const hdNode = new SalmonWalletHDNode(ellipticPair)
    this.walletAccount = new WhaleWalletAccount(this.whaleClient, hdNode,
      getNetwork(network as NetworkName))

    const prevout = new WhalePrevoutProvider(this.walletAccount, 10)
    const feeRate = new WhaleFeeRateProvider(this.whaleClient)

    this.oraclesManager = new OraclesManager(
      async (hex: string) => {
        return await this.whaleClient.transactions.send({ hex })
      },
      ellipticPair,
      feeRate,
      prevout
    )
  }
}
