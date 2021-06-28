const { JsonRpcClient } = require('@defichain/jellyfish-api-jsonrpc')
const { GenesisKeys } = require('@defichain/testcontainers')
const BigNumber = require('bignumber.js')
const { mockFinnhubbEndpoints, mockTiingoEndpoints, mockIexcloudEndpoints } = require('./mocks')
const finnhubb = require('../../../dist/finnhubb')
const tiingo = require('../../../dist/tiingo')
const iexcloud = require('../../../dist/iexcloud')
const waitForExpect = require('wait-for-expect')

const oracleOwner = GenesisKeys[GenesisKeys.length - 1].operator
const client = new JsonRpcClient('http://playground:playground@localhost:3003')

async function setupOracle() {
  const oracleId = await client.oracle.appointOracle(oracleOwner.address, [
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
    expect((await client.wallet.getTransaction(oracleId)).confirmations).toBeGreaterThanOrEqual(3)
  }, 10000)

  return oracleId
}

beforeAll(async () => {
  process.env.OCEAN_URL = 'http://localhost:3001'
  process.env.NETWORK = 'regtest'
  process.env.CURRENCY = 'USD'
  process.env.SYMBOLS = 'TSLA,AAPL,FB'
  process.env.PRIVATE_KEY = oracleOwner.privKey
})

describe('e2e', () => {
  it('should run all lambda functions', async () => {
    try {
      const txid = await client.wallet.sendToAddress(oracleOwner.address, 1)
      await waitForExpect(async () => {
        const confirms = (await client.wallet.getTransaction(txid)).confirmations
        expect(confirms).toBeGreaterThanOrEqual(2)
      }, 5000)
    
      mockFinnhubbEndpoints()
      const finnhubbOracleId = await setupOracle()
      process.env.ORACLE_ID = finnhubbOracleId
      process.env.API_TOKEN = 'API_TOKEN'
      await finnhubb.handler({})

      await waitForExpect(async () => {
        expect((await client.oracle.getOracleData(finnhubbOracleId)).tokenPrices.length).toBeGreaterThan(1)
      }, 10000)

      mockTiingoEndpoints()
      const tiingoOracleId = await setupOracle()
      process.env.ORACLE_ID = tiingoOracleId
      process.env.API_TOKEN = 'API_TOKEN'
      await tiingo.handler({})

      await waitForExpect(async () => {
        expect((await client.oracle.getOracleData(tiingoOracleId)).tokenPrices.length).toBeGreaterThan(1)
      }, 10000)

      mockIexcloudEndpoints()
      const iexcloudOracleId = await setupOracle()
      process.env.ORACLE_ID = iexcloudOracleId
      process.env.API_TOKEN = 'API_TOKEN'
      await iexcloud.handler({})

      await waitForExpect(async () => {
        expect((await client.oracle.getOracleData(iexcloudOracleId)).tokenPrices.length).toBeGreaterThan(1)
      }, 10000)

      const aaplPrice = new BigNumber(await client.oracle.getPrice({ currency: 'USD', token: 'AAPL' }))
      expect(aaplPrice).toStrictEqual(new BigNumber('130'))

      const fbPrice = new BigNumber(await client.oracle.getPrice({ currency: 'USD', token: 'FB' }))
      expect(fbPrice).toStrictEqual(new BigNumber('340'))

      const tslaPrice = new BigNumber(await client.oracle.getPrice({ currency: 'USD', token: 'TSLA' }))
      expect(tslaPrice).toStrictEqual(new BigNumber('606'))
    } catch(e) {
      console.log(e)
    }
  })
})
