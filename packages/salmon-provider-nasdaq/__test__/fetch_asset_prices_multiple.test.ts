
import nock from 'nock'
import { PriceManager, PriceSourceConfig } from '@defichain/salmon-price-functions'
import { NasdaqPriceProvider } from '../src'
import BigNumber from 'bignumber.js'

describe('multi price fetch', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should fetch price from nasdaq using config', async () => {
    nock('https://restapi.clouddataservice.nasdaq.com/v1/auth')
      .post('/token')
      .reply(200, function (_) {
        return `{
          "access_token": "access_token"
        }`
      })

    nock('https://restapi.clouddataservice.nasdaq.com/v1/nasdaq/realtime/equities/lastsale')
      .get('/TSLA')
      .reply(200, function (_) {
        return `{
          "symbol": "TSLA",
          "timestamp": "2021-08-05T16:00:02.430",
          "price": 714.63,
          "size": 199,
          "conditions": "@6 X",
          "exchange": "Q",
          "securityClass": "Q",
          "changeIndicator": 0
        }`
      })

    nock('https://restapi.clouddataservice.nasdaq.com/v1/nasdaq/realtime/equities/lastsale')
      .get('/AAPL')
      .reply(200, function (_) {
        return `{
          "symbol": "AAPL",
          "timestamp": "2021-08-05T16:00:02.286",
          "price": 147.06,
          "size": 12,
          "conditions": "@6 X",
          "exchange": "Q",
          "securityClass": "Q",
          "changeIndicator": 0
        }`
      })

    nock('https://restapi.clouddataservice.nasdaq.com/v1/nasdaq/realtime/equities/lastsale')
      .get('/FB')
      .reply(200, function (_) {
        return `{
          "symbol": "FB",
          "timestamp": "2021-08-05T16:00:03.279",
          "price": 362.97,
          "size": 114,
          "conditions": "@6 X",
          "exchange": "Q",
          "securityClass": "Q",
          "changeIndicator": 0
        }`
      })

    const config: PriceSourceConfig = {
      symbols: ['TSLA', 'AAPL', 'FB']
    }

    const priceManager = new PriceManager(config, new NasdaqPriceProvider('API_TOKEN'))
    const prices = await priceManager.fetchAssetPrices()
    expect(prices[0].asset).toStrictEqual('TSLA')
    expect(prices[0].price).toStrictEqual(new BigNumber(714.63))
    expect(prices[0].timestamp).toStrictEqual(new BigNumber(1628193602430))
    expect(prices[1].asset).toStrictEqual('AAPL')
    expect(prices[1].price).toStrictEqual(new BigNumber(147.06))
    expect(prices[1].timestamp).toStrictEqual(new BigNumber(1628193602286))
    expect(prices[2].asset).toStrictEqual('FB')
    expect(prices[2].price).toStrictEqual(new BigNumber(362.97))
    expect(prices[2].timestamp).toStrictEqual(new BigNumber(1628193603279))
  })
})
