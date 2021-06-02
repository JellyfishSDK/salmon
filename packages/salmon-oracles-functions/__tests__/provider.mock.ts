import { Bech32, Elliptic, EllipticPair, HASH160, WIF } from "@defichain/jellyfish-crypto";
import { FeeRateProvider, Prevout, PrevoutProvider } from "@defichain/jellyfish-transaction-builder"
import { OP_CODES } from "@defichain/jellyfish-transaction"
import { MasterNodeRegTestContainer } from "@defichain/testcontainers";
import BigNumber from "bignumber.js";

// TODO(fuxingloh): All these mock can be replaced with whale.
//  But whale is harder to setup than @defichain/testcontainers.

export class MockFeeRateProvider implements FeeRateProvider {
  constructor (
    public readonly container: MasterNodeRegTestContainer
  ) {
  }

  async estimate (): Promise<BigNumber> {
    const result = await this.container.call('estimatesmartfee', [1])
    if (result.errors !== undefined && result.errors.length > 0) {
      return new BigNumber('0.00005000')
    }
    return new BigNumber(result.feerate)
  }
}

export class MockPrevoutProvider implements PrevoutProvider {
  constructor (
    public readonly container: MasterNodeRegTestContainer,
    public ellipticPair: EllipticPair
  ) {
  }

  async all (): Promise<Prevout[]> {
    const pubKey = await this.ellipticPair.publicKey()
    const unspent: any[] = await this.container.call('listunspent', [
      1, 9999999, [Bech32.fromPubKey(pubKey, 'bcrt')]
    ])

    return unspent.map((utxo: any): Prevout => {
      return MockPrevoutProvider.mapPrevout(utxo, pubKey)
    })
  }

  async collect (minBalance: BigNumber): Promise<Prevout[]> {
    const pubKey = await this.ellipticPair.publicKey()
    const address = Bech32.fromPubKey(pubKey, 'bcrt')

    // TODO(fuxingloh): minimumSumAmount behavior is weirdly inconsistent, listunspent will always
    //  return the correct result without providing options. However, with 'minimumSumAmount', it
    //  will appear sometimes. Likely due to race conditions in bitcoin code,
    //  e.g. -reindex when importprivkey.
    const unspent: any[] = await this.container.call('listunspent', [
      1, 9999999, [address], true
    ])

    return unspent.map((utxo: any): Prevout => {
      return MockPrevoutProvider.mapPrevout(utxo, pubKey)
    })
  }

  static mapPrevout (utxo: any, pubKey: Buffer): Prevout {
    return {
      txid: utxo.txid,
      vout: utxo.vout,
      value: new BigNumber(utxo.amount),
      script: {
        stack: [
          OP_CODES.OP_0,
          OP_CODES.OP_PUSHDATA(HASH160(pubKey), 'little')
        ]
      },
      tokenId: utxo.tokenId
    }
  }
}

export async function getProviders (container: MasterNodeRegTestContainer): Promise<MockProviders> {
  return new MockProviders(container)
}


/**
 * For test mocking only, obviously not secured.
 */
export function randomEllipticPair (): EllipticPair {
  return Elliptic.fromPrivKey(Buffer.alloc(32, Math.random().toString(), 'ascii'))
}

export class MockProviders {
  fee: MockFeeRateProvider
  prevout: MockPrevoutProvider
  ellipticPair: EllipticPair = randomEllipticPair()

  constructor (readonly container: MasterNodeRegTestContainer) {
    this.fee = new MockFeeRateProvider(container)
    this.prevout = new MockPrevoutProvider(container, this.ellipticPair)
  }

  /**
   * As MockProvider is linked to a full node you need to reset everytime you want to fund
   * a new transaction.
   */
  randomizeEllipticPair (): void {
    this.ellipticPair = randomEllipticPair()
    this.prevout.ellipticPair = this.ellipticPair
  }

  /**
   * Sets a new elliptic pair on the provider
   */
  setEllipticPair (ellipticPair: EllipticPair): void {
    this.ellipticPair = ellipticPair
    this.prevout.ellipticPair = this.ellipticPair
  }

  async getAddress (): Promise<string> {
    const pubKey = await this.ellipticPair.publicKey()
    return Bech32.fromPubKey(pubKey, 'bcrt', 0x00)
  }

  async setupMocks (): Promise<void> {
    // full nodes need importprivkey or else it can't list unspent
    const wif = WIF.encode(0xef, await this.ellipticPair.privateKey())
    await this.container.call('importprivkey', [wif])
  }
}
