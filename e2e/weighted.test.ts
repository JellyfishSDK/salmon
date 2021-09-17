/* eslint-disable  @typescript-eslint/no-var-requires */
import BigNumber from 'bignumber.js'
import waitForExpect from 'wait-for-expect'
import { mockFinnhubbEndpoints } from './mocks_finnhubb'
import { mockTiingoEndpoints } from './mocks_tiingo'
import { mockIexcloudEndpoints } from './mocks_iexcloud'
import { oracleOwner, client, setupOracle } from './setup'
const { tiingo, iex, finnhubb } = require('../dist')

beforeAll(async () => {
  process.env.OCEAN_URL = 'http://localhost:3001'
  process.env.NETWORK = 'regtest'
  process.env.CURRENCY = 'USD'
  process.env.SYMBOLS = 'TSLA,AAPL,FB'
  process.env.API_TOKEN = 'API_TOKEN'
  process.env.PRIVATE_KEY = oracleOwner.privKey
})

describe('e2e weighted', () => {
  it('should test weighted price with multiple providers', async () => {
    const txid = await client.wallet.sendToAddress(oracleOwner.address, 1)
    await waitForExpect(async () => {
      const confirms = (await client.wallet.getTransaction(txid)).confirmations
      expect(confirms).toBeGreaterThanOrEqual(2)
    }, 20000)

    mockFinnhubbEndpoints()
    const finnhubbOracleId = await setupOracle()
    process.env.ORACLE_ID = finnhubbOracleId
    await finnhubb({})

    await waitForExpect(async () => {
      expect((await client.oracle.getOracleData(finnhubbOracleId)).tokenPrices.length).toBeGreaterThanOrEqual(3)
    }, 20000)

    mockTiingoEndpoints()
    const tiingoOracleId = await setupOracle()
    process.env.ORACLE_ID = tiingoOracleId
    await tiingo({})

    await waitForExpect(async () => {
      expect((await client.oracle.getOracleData(tiingoOracleId)).tokenPrices.length).toBeGreaterThanOrEqual(3)
    }, 20000)

    mockIexcloudEndpoints()
    const iexcloudOracleId = await setupOracle()
    process.env.ORACLE_ID = iexcloudOracleId
    await iex({})

    await waitForExpect(async () => {
      expect((await client.oracle.getOracleData(iexcloudOracleId)).tokenPrices.length).toBeGreaterThanOrEqual(3)
    }, 20000)

    const aaplPrice = new BigNumber(await client.oracle.getPrice({ currency: 'USD', token: 'AAPL' }))
    expect(aaplPrice).toStrictEqual(new BigNumber('130'))

    const fbPrice = new BigNumber(await client.oracle.getPrice({ currency: 'USD', token: 'FB' }))
    expect(fbPrice).toStrictEqual(new BigNumber('340'))

    const tslaPrice = new BigNumber(await client.oracle.getPrice({ currency: 'USD', token: 'TSLA' }))
    expect(tslaPrice).toStrictEqual(new BigNumber('606'))
  })
})
