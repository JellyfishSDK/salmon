/* eslint-disable  @typescript-eslint/no-var-requires */
import waitForExpect from 'wait-for-expect'
import { mockTiingoEndpoints } from './mocks_tiingo'
import { oracleOwner, client, setupOracle } from './setup'
const { tiingo } = require('../dist')

describe('e2e single tiingo', () => {
  it('should run tiingo provider lambda function', async () => {
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

    mockTiingoEndpoints()
    const tiingoOracleId = await setupOracle()
    process.env.ORACLE_ID = tiingoOracleId
    process.env.API_TOKEN = 'API_TOKEN'
    await tiingo({})

    await waitForExpect(async () => {
      expect((await client.oracle.getOracleData(tiingoOracleId)).tokenPrices.length).toBeGreaterThanOrEqual(3)
    }, 10000)

    const oracleData = await client.oracle.getOracleData(tiingoOracleId)
    expect(oracleData.tokenPrices[0].amount).toStrictEqual(120)
    expect(oracleData.tokenPrices[1].amount).toStrictEqual(340)
    expect(oracleData.tokenPrices[2].amount).toStrictEqual(606)
  })
})
