
import nock from 'nock'
import { PriceManager, PriceSourceConfig } from '@defichain/salmon-price-functions'
import { TiingoPriceProvider } from '../src'
import BigNumber from 'bignumber.js'

describe('multi price fetch', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should fetch price from tiingo using config', async () => {
    nock('https://api.tiingo.com/iex')
      .get('/?tickers=TSLA,AAPL,FB&token=API_TOKEN')
      .reply(200, function (_) {
        return `[
          {
            "bidPrice":null,
            "last":605.13,
            "quoteTimestamp":"2021-06-07T20:00:00+00:00",
            "bidSize":null,
            "high":610.0,
            "timestamp":"2021-06-07T20:00:00+00:00",
            "tngoLast":605.13,
            "lastSize":null,
            "askSize":null,
            "ticker":"TSLA",
            "askPrice":null,
            "low":582.88,
            "open":591.825,
            "prevClose":599.05,
            "mid":null,
            "lastSaleTimestamp":"2021-06-07T20:00:00+00:00",
            "volume":22543682
          },
          {
            "last":125.9,
            "bidPrice":null,
            "quoteTimestamp":"2021-06-07T20:00:00+00:00",
            "lastSize":null,
            "open":126.17,
            "timestamp":"2021-06-07T20:00:00+00:00",
            "tngoLast":125.9,
            "bidSize":null,
            "askSize":null,
            "ticker":"AAPL",
            "askPrice":null,
            "low":124.8321,
            "high":126.32,
            "prevClose":125.89,
            "mid":null,
            "lastSaleTimestamp":"2021-06-07T20:00:00+00:00",
            "volume":71057550
          },
          {
            "last":336.58,
            "bidPrice":null,
            "quoteTimestamp":"2021-06-07T20:00:00+00:00",
            "lastSize":null,
            "open":329.48,
            "timestamp":"2021-06-07T20:00:00+00:00",
            "tngoLast":336.58,
            "bidSize":null,
            "askSize":null,
            "ticker":"FB",
            "askPrice":null,
            "low":328.93,
            "high":337.69,
            "prevClose":330.35,
            "mid":null,
            "lastSaleTimestamp":"2021-06-07T20:00:00+00:00",
            "volume":20136707
          }
        ]`
      })

    const tiingoConfig: PriceSourceConfig = {
      symbols: ['TSLA', 'AAPL', 'FB']
    }

    const priceManager = new PriceManager(tiingoConfig, new TiingoPriceProvider('API_TOKEN'))
    const prices = await priceManager.fetchAssetPrices()
    expect(prices[0].asset).toStrictEqual('TSLA')
    expect(prices[0].price).toStrictEqual(new BigNumber(605.13))
    expect(prices[0].timestamp).toStrictEqual(new BigNumber(1623096000000))
    expect(prices[1].asset).toStrictEqual('AAPL')
    expect(prices[1].price).toStrictEqual(new BigNumber(125.9))
    expect(prices[1].timestamp).toStrictEqual(new BigNumber(1623096000000))
    expect(prices[2].asset).toStrictEqual('FB')
    expect(prices[2].price).toStrictEqual(new BigNumber(336.58))
    expect(prices[2].timestamp).toStrictEqual(new BigNumber(1623096000000))
  })
})
