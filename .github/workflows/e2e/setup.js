const { JsonRpcClient } = require('@defichain/jellyfish-api-jsonrpc')
const { GenesisKeys } = require('@defichain/testcontainers')
const waitForExpect = require('wait-for-expect')

exports.oracleOwner = GenesisKeys[GenesisKeys.length - 1].operator
exports.client = new JsonRpcClient('http://playground:playground@localhost:3003')

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