const waitForExpect = require('wait-for-expect')
const { mockFinnhubbEndpoints } = require('./mocks_finnhubb')
const { mockTiingoEndpoints } = require('./mocks_tiingo')
const { mockIexcloudEndpoints } = require('./mocks_iexcloud')
const finnhubb = require('../../../dist/finnhubb')
const tiingo = require('../../../dist/tiingo')
const iexcloud = require('../../../dist/iexcloud')
const { oracleOwner, client, setupOracle } = require('./setup')

beforeAll(async () => {
  process.env.OCEAN_URL = 'http://localhost:3001'
  process.env.NETWORK = 'regtest'
  process.env.CURRENCY = 'USD'
  process.env.SYMBOLS = 'TSLA,AAPL,FB'
  process.env.PRIVATE_KEY = oracleOwner.privKey
})

describe('e2e single', () => {
  it('should run finnhubb provider lambda function', async () => {
    const txid = await client.wallet.sendToAddress(oracleOwner.address, 1)
    await waitForExpect(async () => {
      const confirms = (await client.wallet.getTransaction(txid)).confirmations
      expect(confirms).toBeGreaterThanOrEqual(2)
    }, 10000)
  
    mockFinnhubbEndpoints()
    const finnhubbOracleId = await setupOracle()
    process.env.ORACLE_ID = finnhubbOracleId
    process.env.API_TOKEN = 'API_TOKEN'
    await finnhubb.handler({})

    await waitForExpect(async () => {
      expect((await client.oracle.getOracleData(finnhubbOracleId)).tokenPrices.length).toBeGreaterThanOrEqual(3)
    }, 10000)
  })

  it('should run tiingo provider lambda function', async () => {
    const txid = await client.wallet.sendToAddress(oracleOwner.address, 1)
    await waitForExpect(async () => {
      const confirms = (await client.wallet.getTransaction(txid)).confirmations
      expect(confirms).toBeGreaterThanOrEqual(2)
    }, 10000)

    mockTiingoEndpoints()
    const tiingoOracleId = await setupOracle()
    process.env.ORACLE_ID = tiingoOracleId
    process.env.API_TOKEN = 'API_TOKEN'
    await tiingo.handler({})

    await waitForExpect(async () => {
      expect((await client.oracle.getOracleData(tiingoOracleId)).tokenPrices.length).toBeGreaterThanOrEqual(3)
    }, 10000)
  })

  it('should run iexcloud provider lambda function', async () => {
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
