/* eslint-disable  @typescript-eslint/no-var-requires */
import waitForExpect from 'wait-for-expect'
import { mockFinnhubbEndpoints } from './mocks_finnhubb_price_protection'
import { oracleOwner, client, setupOracle } from './setup'
import { WhaleOraclesManager } from '@defichain/salmon-oracles-functions'
const { finnhubb, getEnvironmentConfig } = require('../dist')

describe('e2e single price protection', () => {
  it('should protect from price fluctuation', async () => {
    process.env.OCEAN_URL = 'http://localhost:3001'
    process.env.NETWORK = 'regtest'
    process.env.CURRENCY = 'USD'
    process.env.SYMBOLS = 'TSLA'
    process.env.PRIVATE_KEY = oracleOwner.privKey
    process.env.SLACK_WEBHOOK_URL = 'http://MOCK_SLACK/post'

    const txid = await client.wallet.sendToAddress(oracleOwner.address, 1)
    await client.wallet.sendToAddress(oracleOwner.address, 1)
    await waitForExpect(async () => {
      const confirms = (await client.wallet.getTransaction(txid)).confirmations
      expect(confirms).toBeGreaterThanOrEqual(2)
    }, 10000)

    mockFinnhubbEndpoints()
    const finnhubbOracleId = await setupOracle()
    process.env.ORACLE_ID = finnhubbOracleId
    process.env.API_TOKEN = 'API_TOKEN'
    await finnhubb({})

    const env = await getEnvironmentConfig()
    const oraclesManager = WhaleOraclesManager.withWhaleClient(env.oceanUrl, env.network, env.privateKey)

    await waitForExpect(async () => {
      const existing = await oraclesManager.whaleClient.oracles.getPriceFeed(env.oracleId,
        env.symbols[0], env.currency, 1)

      expect(existing.length).toStrictEqual(1)
    }, 30000)

    const result = await finnhubb({})
    const resultJSON = JSON.parse(result.body)
    expect(resultJSON.prices.length).toStrictEqual(0)
  })
})
