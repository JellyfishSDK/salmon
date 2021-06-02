import { MasterNodeRegTestContainer } from '@defichain/testcontainers'
import { getProviders, MockProviders } from './provider.mock'

const container = new MasterNodeRegTestContainer()
let providers: MockProviders

beforeAll(async () => {
  await container.start()
  await container.waitForReady()
  await container.waitForWalletCoinbaseMaturity()
  providers = await getProviders(container)

  await container.waitForWalletBalanceGTE(100)
})

afterAll(async () => {
  await container.stop()
})

describe('basic setup test', () => {
  it('should get address', async () => {
    console.log(await providers.getAddress())
  })

  it('should get block count', async () => {
    console.log(await container.getBlockCount())
  })
})
