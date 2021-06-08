
import nock from 'nock'
import { PriceManager, PriceSourceConfig } from '../src'
import BigNumber from 'bignumber.js'

const tiingoResponse = `[
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

const iexResponse = `[
  {
    "symbol": "FB",
    "bidSize": 200,
    "bidPrice": 120.8,
    "askSize": 100,
    "askPrice": 122.5,
    "volume": 205208,
    "lastSalePrice": 121.41,
    "lastSaleSize": 100,
    "lastSaleTime": 1480446908666,
    "lastUpdated": 1480446923942,
    "sector": "softwareservices",
    "securityType": "commonstock"
  }
]`

const finnhubbResponse = `{
  "c": 261.74,
  "h": 263.31,
  "l": 260.68,
  "o": 261.07,
  "pc": 259.45,
  "t": 1582641000 
}`

const tiingoConfig: PriceSourceConfig = {
  apiToken: 'API_TOKEN',
  symbols: ['TSLA'],
  symbolPath: 'ticker',
  symbolQuery: 'tickers',
  baseUrl: 'https://api.tiingo.com/iex/',
  pricePath: 'last'
}

const iexConfig: PriceSourceConfig = {
  apiToken: 'API_TOKEN',
  symbols: ['FB'],
  symbolPath: 'symbol',
  symbolQuery: 'symbols',
  baseUrl: 'https://cloud.iexapis.com/stable/tops',
  pricePath: 'lastSalePrice'
}

const finnhubbConfig: PriceSourceConfig = {
  apiToken: 'API_TOKEN',
  symbols: ['AAPL'],
  symbolQuery: 'symbol',
  baseUrl: 'https://finnhub.io/api/v1/quote',
  pricePath: 'c'
}

describe('JSON-RPC 1.0 specification', () => {
  beforeEach(() => {
    nock('https://api.tiingo.com/iex')
      .get('/?tickers=TSLA&token=API_TOKEN')
      .reply(200, function (_) {
        return tiingoResponse
      })

    nock('https://cloud.iexapis.com/stable/tops')
      .get('?symbols=FB&token=API_TOKEN')
      .reply(200, function (_) {
        return iexResponse
      })

    nock('https://finnhub.io/api/v1/quote')
      .get('?symbol=AAPL&token=API_TOKEN')
      .reply(200, function (_) {
        return finnhubbResponse
      })
  })

  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should fatch price from tiingo using config', async () => {
    const priceManager = new PriceManager()
    const prices = await priceManager.fetchAssetPrices(tiingoConfig)
    expect(prices[0].asset).toStrictEqual('TSLA')
    expect(prices[0].price).toStrictEqual(new BigNumber(625.22))
  })

  it('should fatch price from iexcloud using config', async () => {
    const priceManager = new PriceManager()
    const prices = await priceManager.fetchAssetPrices(iexConfig)
    expect(prices[0].asset).toStrictEqual('FB')
    expect(prices[0].price).toStrictEqual(new BigNumber(121.41))
  })

  it('should fatch price from finnhubb using config', async () => {
    const priceManager = new PriceManager()
    const prices = await priceManager.fetchAssetPrices(finnhubbConfig)
    expect(prices[0].asset).toStrictEqual('AAPL')
    expect(prices[0].price).toStrictEqual(new BigNumber(261.74))
  })
})
