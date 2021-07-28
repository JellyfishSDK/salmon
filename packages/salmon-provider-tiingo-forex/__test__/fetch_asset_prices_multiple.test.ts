
import nock from 'nock'
import { PriceManager, PriceSourceConfig } from '@defichain/salmon-price-functions'
import { TiingoForexPriceProvider } from '../src'
import BigNumber from 'bignumber.js'

describe('multi price fetch', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should fetch price from tiingo using config', async () => {
    nock('https://api.tiingo.com/tiingo/fx/top')
      .get('?tickers=xauusd,eurusd,usdsgd&token=API_TOKEN')
      .reply(200, function (_) {
        return `[
          {
            "ticker": "xauusd",
            "quoteTimestamp": "2021-07-13T07:04:15.484000+00:00",
            "bidPrice": 1810.67,
            "bidSize": 1000000,
            "askPrice": 1811.21,
            "askSize": 1000000,
            "midPrice": 1810.94
          },
          {
            "ticker": "eurusd",
            "quoteTimestamp": "2021-07-13T07:03:32.191000+00:00",
            "bidPrice": 1.17978,
            "bidSize": 1000000,
            "askPrice": 1.19172,
            "askSize": 1000000,
            "midPrice": 1.18575
          },
          {
            "ticker": "usdsgd",
            "quoteTimestamp": "2021-07-13T07:02:20.354000+00:00",
            "bidPrice": 1.3438,
            "bidSize": 1000000,
            "askPrice": 1.35907,
            "askSize": 1000000,
            "midPrice": 1.351435
          }
        ]`
      })

    const tiingoConfig: PriceSourceConfig = {
      symbols: ['XAU', 'EUR', 'SGD']
    }

    const priceManager = new PriceManager(tiingoConfig, new TiingoForexPriceProvider('API_TOKEN'))
    const prices = await priceManager.fetchAssetPrices()
    expect(prices[0].asset).toStrictEqual('XAU')
    expect(prices[0].price).toStrictEqual(new BigNumber(1810.94))
    expect(prices[0].timestamp).toStrictEqual(new BigNumber(1626159855484))
    expect(prices[1].asset).toStrictEqual('EUR')
    expect(prices[1].price).toStrictEqual(new BigNumber(1.18575))
    expect(prices[1].timestamp).toStrictEqual(new BigNumber(1626159812191))
    expect(prices[2].asset).toStrictEqual('SGD')
    expect(prices[2].price).toStrictEqual(new BigNumber(1).div(new BigNumber(1.351435)))
    expect(prices[2].timestamp).toStrictEqual(new BigNumber(1626159740354))
  })
})
