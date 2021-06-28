const waitForExpect = require('wait-for-expect')
const { mockIexcloudEndpoints } = require('./mocks_iexcloud')
const iexcloud = require('../../../dist/iexcloud')
const { oracleOwner, client, setupOracle } = require('./setup')

describe('e2e single iexcloud', () => {
  it('should run iexcloud provider lambda function', async () => {
    process.env.OCEAN_URL = 'http://localhost:3001'
    process.env.NETWORK = 'regtest'
    process.env.CURRENCY = 'USD'
    process.env.SYMBOLS = 'TSLA,AAPL,FB'
    process.env.PRIVATE_KEY = oracleOwner.privKey

    const txid = await client.wallet.sendToAddress(oracleOwner.address, 1)
    await waitForExpect(async () => {
      const confirms = (await client.wallet.getTransaction(txid)).confirmations
      expect(confirms).toBeGreaterThanOrEqual(2)
    }, 10000)

    mockIexcloudEndpoints()
    const iexcloudOracleId = await setupOracle()
    process.env.ORACLE_ID = iexcloudOracleId
    process.env.API_TOKEN = 'API_TOKEN'
    await iexcloud.handler({})

    await waitForExpect(async () => {
      expect((await client.oracle.getOracleData(iexcloudOracleId)).tokenPrices.length).toBeGreaterThanOrEqual(3)
    }, 10000)
  })
})
