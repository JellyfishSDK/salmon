const { PlaygroundRpcClient, PlaygroundApiClient } = require('@defichain/playground-api-client')
const { GenesisKeys } = require('@defichain/testcontainers')
const waitForExpect = require('wait-for-expect')

exports.oracleOwner = GenesisKeys[GenesisKeys.length - 1].operator
exports.client = new PlaygroundRpcClient(
  new PlaygroundApiClient({ url: 'http://localhost:3002' }))
  
exports.setupOracle = async function() {
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
