const { JsonRpcClient } = require('@defichain/jellyfish-api-jsonrpc')
const { GenesisKeys } = require('@defichain/testcontainers')
const BigNumber = require('bignumber.js')
const { mockFinnhubbEndpoints, mockTiingoEndpoints, mockIexcloudEndpoints } = require('./mocks')
const finnhubb = require('../../../dist/finnhubb')
const tiingo = require('../../../dist/tiingo')
const iexcloud = require('../../../dist/iexcloud')

const oracleOwner = GenesisKeys[GenesisKeys.length - 1].operator
const client = new JsonRpcClient('http://playground:playground@localhost:3003')

const waitFor = (condition) => {
  return new Promise((r) => {
    const testCondition = async () => {
      if (await condition()) {
        r()
      } else {
        setTimeout(testCondition, 500)
      }
    }

    testCondition()
  })
}

const waitForTxConfirm = async (txid) => {
  await waitFor(async () => {
    return (await client.wallet.getTransaction(txid)).confirmations > 3
  })
}

const setupOracle = async () => {
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

  await waitForTxConfirm(oracleId)
  return oracleId
}

beforeAll(async () => {
  process.env.OCEAN_URL = 'http://localhost:3001'
  process.env.NETWORK = 'regtest'
  process.env.CURRENCY = 'USD'
  process.env.SYMBOLS = 'TSLA,AAPL,FB'
  process.env.PRIVATE_KEY = oracleOwner.privKey

  const txids = await Promise.all(Array(6).fill(0).map(() => client.wallet.sendToAddress(oracleOwner.address, 1)))
  await Promise.all(txids.map(txid => waitForTxConfirm(txid)))
})

afterAll(async () => {
  expect(new BigNumber(await client.oracle.getPrice({ currency: 'USD', token: 'AAPL' }))).toStrictEqual(new BigNumber('130'))
  expect(new BigNumber(await client.oracle.getPrice({ currency: 'USD', token: 'FB' }))).toStrictEqual(new BigNumber('340'))
  expect(new BigNumber(await client.oracle.getPrice({ currency: 'USD', token: 'TSLA' }))).toStrictEqual(new BigNumber('606'))
})

describe('e2e', () => {
  it('should run all lambda functions', async () => {
    try {
      mockFinnhubbEndpoints()
      const finnhubbOracleId = await setupOracle()
      process.env.ORACLE_ID = finnhubbOracleId
      process.env.API_TOKEN = 'API_TOKEN'
      await finnhubb.handler({})
      await waitFor(async () => {
        try {
          return (await client.oracle.getOracleData(finnhubbOracleId)).tokenPrices.length > 1
        } catch(e) {
          return false
        }
      })

      mockTiingoEndpoints()
      const tiingoOracleId = await setupOracle()
      process.env.ORACLE_ID = tiingoOracleId
      process.env.API_TOKEN = 'API_TOKEN'
      await tiingo.handler({})
      await waitFor(async () => {
        try {
          return (await client.oracle.getOracleData(tiingoOracleId)).tokenPrices.length > 0
        } catch(e) {
          return false
        }
      })

      mockIexcloudEndpoints()
      const iexcloudOracleId = await setupOracle()
      process.env.ORACLE_ID = iexcloudOracleId
      process.env.API_TOKEN = 'API_TOKEN'
      await iexcloud.handler({})
      await waitFor(async () => {
        try {
          return (await client.oracle.getOracleData(iexcloudOracleId)).tokenPrices.length > 0
        } catch(e) {
          return false
        }
      })
    } catch(e) {
      console.log(e)
    }
  })
})
