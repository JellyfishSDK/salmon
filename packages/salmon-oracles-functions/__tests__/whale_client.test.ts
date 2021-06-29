import nock from 'nock'
import { OraclesManager, SalmonWalletHDNode } from '@defichain/salmon-oracles-functions'
import { GenesisKeys } from '@defichain/testcontainers'
import { WIF } from '@defichain/jellyfish-crypto'

describe('whale client', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should create oracles manager with whale client', async () => {
    OraclesManager.withWhaleClient('http://127.0.0.1', 'regtest',
      GenesisKeys[GenesisKeys.length - 1].owner.privKey)
  })
})

describe('salmon wallet hd node', () => {
  it('only returns pubkey', async () => {
    const ellipticPair = WIF.asEllipticPair(GenesisKeys[GenesisKeys.length - 1].owner.privKey)
    const hdNode = new SalmonWalletHDNode(ellipticPair)
    expect(await hdNode.publicKey()).toStrictEqual(await ellipticPair.publicKey())
    await expect(hdNode.privateKey()).rejects.toThrow('Attempting to retrieve private key')
    await expect(hdNode.sign(Buffer.alloc(0))).rejects.toThrow('Attempting to sign')
    await expect(hdNode.verify(Buffer.alloc(0), Buffer.alloc(0))).rejects.toThrow('Attempting to verify')
    await expect(hdNode.signTx({
      version: 0,
      vin: [],
      vout: [],
      lockTime: 0
    }, [])
    ).rejects.toThrow('Attempting to signTx')
  })
})
