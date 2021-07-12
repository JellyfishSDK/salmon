import { OraclesManager } from '@defichain/salmon-oracles-functions'
import { GenesisKeys } from '@defichain/testcontainers'

describe('whale client', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create oracles manager with whale client', async () => {
    OraclesManager.withWhaleClient('http://127.0.0.1', 'regtest',
      GenesisKeys[GenesisKeys.length - 1].owner.privKey)
  })
})
