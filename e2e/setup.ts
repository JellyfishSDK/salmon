import waitForExpect from 'wait-for-expect'
import { PlaygroundRpcClient, PlaygroundApiClient } from '@defichain/playground-api-client'
import { GenesisKeys } from '@defichain/testcontainers'

export const oracleOwner = GenesisKeys[GenesisKeys.length - 1].operator
export const client = new PlaygroundRpcClient(
  new PlaygroundApiClient({ url: 'http://localhost:3002' }))

export const setupOracle = async function (): Promise<string> {
  const oracleId = await exports.client.oracle.appointOracle(exports.oracleOwner.address, [
    {
      token: 'TSLA',
      currency: 'USD'
    }, {
      token: 'AAPL',
      currency: 'USD'
    }, {
      token: 'FB',
      currency: 'USD'
    }
  ], {
    weightage: 1.0
  })

  await waitForExpect(async () => {
    expect((await exports.client.wallet.getTransaction(oracleId)).confirmations).toBeGreaterThanOrEqual(3)
  }, 10000)

  return oracleId
}
