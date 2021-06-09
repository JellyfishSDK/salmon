
import nock from 'nock'
import { FinnhubbPriceProvider, IexPriceProvider, PriceManager, PriceSourceConfig, TiingoPriceProvider } from '../src'
import BigNumber from 'bignumber.js'

const tiingoResponse = `[
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

const iexResponse = `[
  {
     "symbol":"TSLA",
     "sector":"consumerdurables",
     "securityType":"cs",
     "bidPrice":0,
     "bidSize":0,
     "askPrice":0,
     "askSize":0,
     "lastUpdated":1623096987115,
     "lastSalePrice":605.14,
     "lastSaleSize":10,
     "lastSaleTime":1623095998146,
     "volume":480662
  },
  {
     "symbol":"AAPL",
     "sector":"electronictechnology",
     "securityType":"cs",
     "bidPrice":0,
     "bidSize":0,
     "askPrice":0,
     "askSize":0,
     "lastUpdated":1623099600004,
     "lastSalePrice":126,
     "lastSaleSize":100,
     "lastSaleTime":1623097192802,
     "volume":1401779
  },
  {
     "symbol":"FB",
     "sector":"technologyservices",
     "securityType":"cs",
     "bidPrice":0,
     "bidSize":0,
     "askPrice":0,
     "askSize":0,
     "lastUpdated":1623097044336,
     "lastSalePrice":336.59,
     "lastSaleSize":15,
     "lastSaleTime":1623095999551,
     "volume":598873
  }
]`

const finnhubbResponseTSLA = `{
  "c": 605.14,
  "h": 263.31,
  "l": 260.68,
  "o": 261.07,
  "pc": 259.45,
  "t": 1582641000 
}`

const finnhubbResponseAAPL = `{
  "c": 126,
  "h": 263.31,
  "l": 260.68,
  "o": 261.07,
  "pc": 259.45,
  "t": 1582641000 
}`

const finnhubbResponseFB = `{
  "c": 336.59,
  "h": 263.31,
  "l": 260.68,
  "o": 261.07,
  "pc": 259.45,
  "t": 1582641000 
}`

const tiingoConfig: PriceSourceConfig = {
  symbols: ['TSLA', 'AAPL', 'FB']
}

const iexConfig: PriceSourceConfig = {
  symbols: ['TSLA', 'AAPL', 'FB']
}

const finnhubbConfig: PriceSourceConfig = {
  symbols: ['TSLA', 'AAPL', 'FB']
}

describe('multi price fetch', () => {
  beforeEach(() => {
    nock('https://api.tiingo.com/iex')
      .get('/?tickers=TSLA,AAPL,FB&token=API_TOKEN')
      .reply(200, function (_) {
        return tiingoResponse
      })

    nock('https://cloud.iexapis.com/stable/tops')
      .get('?symbols=TSLA,AAPL,FB&token=API_TOKEN')
      .reply(200, function (_) {
        return iexResponse
      })

    nock('https://finnhub.io/api/v1/quote')
      .get('?symbol=TSLA&token=API_TOKEN')
      .reply(200, function (_) {
        return finnhubbResponseTSLA
      })

    nock('https://finnhub.io/api/v1/quote')
      .get('?symbol=AAPL&token=API_TOKEN')
      .reply(200, function (_) {
        return finnhubbResponseAAPL
      })

    nock('https://finnhub.io/api/v1/quote')
      .get('?symbol=FB&token=API_TOKEN')
      .reply(200, function (_) {
        return finnhubbResponseFB
      })
  })

  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should fatch price from tiingo using config', async () => {
    const priceManager = new PriceManager(tiingoConfig, new TiingoPriceProvider('API_TOKEN'))
    const prices = await priceManager.fetchAssetPrices()
    expect(prices[0].asset).toStrictEqual('TSLA')
    expect(prices[0].price).toStrictEqual(new BigNumber(605.13))
    expect(prices[1].asset).toStrictEqual('AAPL')
    expect(prices[1].price).toStrictEqual(new BigNumber(125.9))
    expect(prices[2].asset).toStrictEqual('FB')
    expect(prices[2].price).toStrictEqual(new BigNumber(336.58))
  })

  it('should fatch price from iexcloud using config', async () => {
    const priceManager = new PriceManager(iexConfig, new IexPriceProvider('API_TOKEN'))
    const prices = await priceManager.fetchAssetPrices()
    expect(prices[0].asset).toStrictEqual('TSLA')
    expect(prices[0].price).toStrictEqual(new BigNumber(605.14))
    expect(prices[1].asset).toStrictEqual('AAPL')
    expect(prices[1].price).toStrictEqual(new BigNumber(126))
    expect(prices[2].asset).toStrictEqual('FB')
    expect(prices[2].price).toStrictEqual(new BigNumber(336.59))
  })

  it('should fatch price from finnhubb using config', async () => {
    const priceManager = new PriceManager(finnhubbConfig, new FinnhubbPriceProvider('API_TOKEN'))
    const prices = await priceManager.fetchAssetPrices()
    expect(prices[0].asset).toStrictEqual('TSLA')
    expect(prices[0].price).toStrictEqual(new BigNumber(605.14))
    expect(prices[1].asset).toStrictEqual('AAPL')
    expect(prices[1].price).toStrictEqual(new BigNumber(126))
    expect(prices[2].asset).toStrictEqual('FB')
    expect(prices[2].price).toStrictEqual(new BigNumber(336.59))
  })
})
