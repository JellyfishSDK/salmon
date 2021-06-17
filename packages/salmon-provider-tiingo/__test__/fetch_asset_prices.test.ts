
import nock from 'nock'
import { PriceManager, PriceSourceConfig } from '@defichain/salmon-price-functions'
import { TiingoPriceProvider } from '../src'
import BigNumber from 'bignumber.js'

describe('single price fetch', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should fetch price from tiingo using config', async () => {
    nock('https://api.tiingo.com/iex')
      .get('/?tickers=TSLA&token=API_TOKEN')
      .reply(200, function (_) {
        return `[
          {
            "lastSaleTimestamp":"2021-05-28T20:00:00+00:00",
            "askSize":null,
            "high":635.59,
            "open":628.5,
            "low":622.38,
            "bidPrice":null,
            "askPrice":null,
            "timestamp":"2021-05-28T20:00:00+00:00",
            "lastSize":null,
            "last":625.22,
            "quoteTimestamp":"2021-05-28T20:00:00+00:00",
            "ticker":"TSLA",
            "mid":null,
            "bidSize":null,
            "volume":22737038,
            "tngoLast":625.22,
            "prevClose":630.85
          }
        ]`
      })

    const tiingoConfig: PriceSourceConfig = {
      symbols: ['TSLA']
    }

    const priceManager = new PriceManager(tiingoConfig, new TiingoPriceProvider('API_TOKEN'))
    const prices = await priceManager.fetchAssetPrices()
    expect(prices[0].asset).toStrictEqual('TSLA')
    expect(prices[0].price).toStrictEqual(new BigNumber(625.22))
    expect(prices[0].timestamp).toStrictEqual(new BigNumber(1622232000000))
  })

  it('complain if symbol list is empty', async () => {
    const badConfig: PriceSourceConfig = {
      symbols: []
    }

    await expect(async () => {
      const priceManager = new PriceManager(badConfig, new TiingoPriceProvider('API_TOKEN'))
      await priceManager.fetchAssetPrices()
    }).rejects.toThrow('Symbol list cannot be empty')
  })

  it('should throw when receiving malformed data', async () => {
    nock('https://api.tiingo.com/iex')
      .get('/?tickers=TSLA&token=API_TOKEN')
      .reply(500, function (_) {
        return 'Error'
      })

    const tiingoConfig: PriceSourceConfig = {
      symbols: ['AAPL']
    }

    const priceManager = new PriceManager(tiingoConfig, new TiingoPriceProvider('API_TOKEN'))
    await expect(async () => {
      await priceManager.fetchAssetPrices()
    }).rejects.toThrow(SyntaxError)
  })
})
