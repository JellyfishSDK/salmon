
import nock from 'nock'
import { FinnhubbPriceProvider, IexPriceProvider, PriceManager, PriceSourceConfig, TiingoPriceProvider } from '../src'
import BigNumber from 'bignumber.js'

describe('single price fetch', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should include only valid timestamp for tiingo', async () => {
    const tiingoResponse = [
      {
        askSize: null,
        high: 635.59,
        open: 628.5,
        low: 622.38,
        bidPrice: null,
        askPrice: null,
        lastSize: null,
        last: 625.22,
        timestamp: '2021-05-28T20:00:00+00:00',
        quoteTimestamp: '2021-05-28T20:00:00+00:00',
        lastSaleTimestamp: '2021-05-28T20:00:00+00:00',
        ticker: 'TSLA',
        mid: null,
        bidSize: null,
        volume: 22737038,
        tngoLast: 625.22,
        prevClose: 630.85
      }
    ]

    nock('https://api.tiingo.com/iex')
      .get('/?tickers=TSLA&token=API_TOKEN')
      .reply(200, function (_) {
        return JSON.stringify(tiingoResponse)
      })

    const tiingoConfig: PriceSourceConfig = {
      symbols: ['TSLA']
    }

    const priceManager = new PriceManager(tiingoConfig, new TiingoPriceProvider('API_TOKEN'))
    const prices = PriceManager.filterTimestamps(await priceManager.fetchAssetPrices(),
      new Date(300000), new Date(tiingoResponse[0].lastSaleTimestamp))
    expect(prices[0].asset).toStrictEqual('TSLA')
    expect(prices[0].price).toStrictEqual(new BigNumber(625.22))
    expect(prices[0].timestamp)
      .toStrictEqual(new BigNumber(new Date('2021-05-28T20:00:00+00:00').getTime()))

    nock.cleanAll()

    const tiingoDate = new Date(tiingoResponse[0].lastSaleTimestamp)
    const dateOld = new Date(tiingoDate.getTime() - 600000)
    nock('https://api.tiingo.com/iex')
      .get('/?tickers=TSLA&token=API_TOKEN')
      .reply(200, function (_) {
        return JSON.stringify([{
          ...tiingoResponse[0],
          lastSaleTimestamp: dateOld.toISOString()
        }])
      })

    const pricesOld = PriceManager.filterTimestamps(await priceManager.fetchAssetPrices(),
      new Date(300000), new Date(tiingoResponse[0].lastSaleTimestamp))
    expect(pricesOld.length).toStrictEqual(0)
  })

  it('should include only valid timestamp for iexcloud', async () => {
    const iexResponse = [
      {
        symbol: 'FB',
        bidSize: 200,
        bidPrice: 120.8,
        askSize: 100,
        askPrice: 122.5,
        volume: 205208,
        lastSalePrice: 121.41,
        lastSaleSize: 100,
        lastSaleTime: Date.now(),
        lastUpdated: 1480446923942,
        sector: 'softwareservices',
        securityType: 'commonstock'
      }
    ]

    nock('https://cloud.iexapis.com/stable/tops')
      .get('?symbols=FB&token=API_TOKEN')
      .reply(200, function (_) {
        return iexResponse
      })

    const iexConfig: PriceSourceConfig = {
      symbols: ['FB']
    }

    const priceManager = new PriceManager(iexConfig, new IexPriceProvider('API_TOKEN'))
    const prices = PriceManager.filterTimestamps(await priceManager.fetchAssetPrices(),
      new Date(300000))
    expect(prices[0].asset).toStrictEqual('FB')
    expect(prices[0].price).toStrictEqual(new BigNumber(121.41))
    expect(prices[0].timestamp).toStrictEqual(new BigNumber(iexResponse[0].lastSaleTime))

    nock.cleanAll()

    const dateOld = new Date(Date.now() - 600000)
    nock('https://cloud.iexapis.com/stable/tops')
      .get('?symbols=FB&token=API_TOKEN')
      .reply(200, function (_) {
        return JSON.stringify([{
          ...iexResponse[0], lastSaleTime: dateOld.getTime()
        }])
      })

    const pricesOld = PriceManager.filterTimestamps(await priceManager.fetchAssetPrices(),
      new Date(300000))
    expect(pricesOld.length).toStrictEqual(0)
  })

  it('should include only valid timestamp for finnhubb', async () => {
    const finnhubbResponse = {
      c: 261.74,
      h: 263.31,
      l: 260.68,
      o: 261.07,
      pc: 259.45,
      t: Date.now() / 1000
    }

    nock('https://finnhub.io/api/v1/quote')
      .get('?symbol=AAPL&token=API_TOKEN')
      .reply(200, function (_) {
        return finnhubbResponse
      })

    const finnhubbConfig: PriceSourceConfig = {
      symbols: ['AAPL']
    }

    const priceManager = new PriceManager(finnhubbConfig, new FinnhubbPriceProvider('API_TOKEN'))
    const prices = PriceManager.filterTimestamps(await priceManager.fetchAssetPrices(),
      new Date(300000))
    expect(prices[0].asset).toStrictEqual('AAPL')
    expect(prices[0].price).toStrictEqual(new BigNumber(261.74))
    expect(prices[0].timestamp).toStrictEqual(new BigNumber(finnhubbResponse.t * 1000))

    nock.cleanAll()

    const dateOld = new Date(Date.now() - 600000)
    nock('https://cloud.iexapis.com/stable/tops')
      .get('?symbols=FB&token=API_TOKEN')
      .reply(200, function (_) {
        return JSON.stringify([{
          ...finnhubbResponse, t: dateOld.getTime() / 1000
        }])
      })

    const pricesOld = PriceManager.filterTimestamps(await priceManager.fetchAssetPrices(),
      new Date(300000))
    expect(pricesOld.length).toStrictEqual(0)
  })
})
