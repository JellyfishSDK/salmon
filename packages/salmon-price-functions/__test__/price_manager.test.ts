
import nock from 'nock'
import { PriceManager } from '../src'
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

describe('JSON-RPC 1.0 specification', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  // Here we use the 'last' price attribute
  it('should fatch price from tiingo', async () => {
    nock('https://api.tiingo.com/iex')
      .get('/?tickers=tsla&token=API_TOKEN')
      .reply(200, function (_) {
        return tiingoResponse
      })

    const priceManager = new PriceManager()
    const price = await priceManager.fetchValueFromSource('https://api.tiingo.com/iex/?tickers=tsla', 'last', 'API_TOKEN')
    expect(price).toStrictEqual(new BigNumber(625.22))
  })

  // Here we use the 'lastSalePrice' price attribute
  it('should fatch price from iexcloud', async () => {
    nock('https://cloud.iexapis.com/stable/tops')
      .get('?symbols=fb&token=API_TOKEN')
      .reply(200, function (_) {
        return iexResponse
      })

    const priceManager = new PriceManager()
    const price = await priceManager.fetchValueFromSource('https://cloud.iexapis.com/stable/tops?symbols=fb', 'lastSalePrice', 'API_TOKEN')
    expect(price).toStrictEqual(new BigNumber(121.41))
  })

  // Here we use the 'c' (current) price attribute
  it('should fatch price from finnhubb', async () => {
    nock('https://finnhub.io/api/v1/quote')
      .get('?symbol=AAPL&token=API_TOKEN')
      .reply(200, function (_) {
        return finnhubbResponse
      })

    const priceManager = new PriceManager()
    const price = await priceManager.fetchValueFromSource('https://finnhub.io/api/v1/quote?symbol=AAPL', 'c', 'API_TOKEN')
    expect(price).toStrictEqual(new BigNumber(261.74))
  })
})
