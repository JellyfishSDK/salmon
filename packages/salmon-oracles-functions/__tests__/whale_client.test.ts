import { OraclesManager, SalmonWalletHDNode } from '@defichain/salmon-oracles-functions'
import { GenesisKeys } from '@defichain/testcontainers'
import { WIF } from '@defichain/jellyfish-crypto'

describe('whale client', () => {
  afterEach(() => {
    jest.clearAllMocks()
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
  })
})
