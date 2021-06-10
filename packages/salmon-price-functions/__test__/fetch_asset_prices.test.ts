
import nock from 'nock'
import { FinnhubbPriceProvider, IexPriceProvider, PriceManager, PriceSourceConfig, TiingoPriceProvider } from '../src'
import BigNumber from 'bignumber.js'

describe('single price fetch', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should fatch price from tiingo using config', async () => {
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

    nock('https://api.tiingo.com/iex')
      .get('/?tickers=TSLA&token=API_TOKEN')
      .reply(200, function (_) {
        return tiingoResponse
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

  it('should fatch price from iexcloud using config', async () => {
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

    nock('https://cloud.iexapis.com/stable/tops')
      .get('?symbols=FB&token=API_TOKEN')
      .reply(200, function (_) {
        return iexResponse
      })

    const iexConfig: PriceSourceConfig = {
      symbols: ['FB']
    }

    const priceManager = new PriceManager(iexConfig, new IexPriceProvider('API_TOKEN'))
    const prices = await priceManager.fetchAssetPrices()
    expect(prices[0].asset).toStrictEqual('FB')
    expect(prices[0].price).toStrictEqual(new BigNumber(121.41))
    expect(prices[0].timestamp).toStrictEqual(new BigNumber(1480446908666))
  })

  it('should fatch price from finnhubb using config', async () => {
    const finnhubbResponse = `{
      "c": 261.74,
      "h": 263.31,
      "l": 260.68,
      "o": 261.07,
      "pc": 259.45,
      "t": 1582641000 
    }`

    nock('https://finnhub.io/api/v1/quote')
      .get('?symbol=AAPL&token=API_TOKEN')
      .reply(200, function (_) {
        return finnhubbResponse
      })

    const finnhubbConfig: PriceSourceConfig = {
      symbols: ['AAPL']
    }
  
    const priceManager = new PriceManager(finnhubbConfig, new FinnhubbPriceProvider('API_TOKEN'))
    const prices = await priceManager.fetchAssetPrices()
    expect(prices[0].asset).toStrictEqual('AAPL')
    expect(prices[0].price).toStrictEqual(new BigNumber(261.74))
    expect(prices[0].timestamp).toStrictEqual(new BigNumber(1582641000000))
  })
})
