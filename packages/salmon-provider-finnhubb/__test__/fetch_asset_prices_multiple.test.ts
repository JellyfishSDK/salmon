
import nock from 'nock'
import { PriceManager, PriceSourceConfig } from '@defichain/salmon-price-functions'
import { FinnhubbPriceProvider } from '../src'
import BigNumber from 'bignumber.js'

describe('multi price fetch', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should fetch price from finnhubb using config', async () => {
    nock('https://finnhub.io/api/v1/quote')
      .get('?symbol=TSLA&token=API_TOKEN')
      .reply(200, function (_) {
        return `{
          "c": 605.14,
          "h": 263.31,
          "l": 260.68,
          "o": 261.07,
          "pc": 259.45,
          "t": 1582641000 
        }`
      })

    nock('https://finnhub.io/api/v1/quote')
      .get('?symbol=AAPL&token=API_TOKEN')
      .reply(200, function (_) {
        return `{
          "c": 126,
          "h": 263.31,
          "l": 260.68,
          "o": 261.07,
          "pc": 259.45,
          "t": 1582641000 
        }`
      })

    nock('https://finnhub.io/api/v1/quote')
      .get('?symbol=FB&token=API_TOKEN')
      .reply(200, function (_) {
        return `{
          "c": 336.59,
          "h": 263.31,
          "l": 260.68,
          "o": 261.07,
          "pc": 259.45,
          "t": 1582641000 
        }`
      })

    const finnhubbConfig: PriceSourceConfig = {
      symbols: ['TSLA', 'AAPL', 'FB']
    }

    const priceManager = new PriceManager(finnhubbConfig, new FinnhubbPriceProvider('API_TOKEN'))
    const prices = await priceManager.fetchAssetPrices()
    expect(prices[0].asset).toStrictEqual('TSLA')
    expect(prices[0].price).toStrictEqual(new BigNumber(605.14))
    expect(prices[0].timestamp).toStrictEqual(new BigNumber(1582641000000))
    expect(prices[1].asset).toStrictEqual('AAPL')
    expect(prices[1].price).toStrictEqual(new BigNumber(126))
    expect(prices[1].timestamp).toStrictEqual(new BigNumber(1582641000000))
    expect(prices[2].asset).toStrictEqual('FB')
    expect(prices[2].price).toStrictEqual(new BigNumber(336.59))
    expect(prices[2].timestamp).toStrictEqual(new BigNumber(1582641000000))
  })

  it('should filter out undefined price', async () => {
    nock('https://finnhub.io/api/v1/quote')
      .get('?symbol=TSLA&token=API_TOKEN')
      .reply(200, function (_) {
        return `{
          "c": 605.14,
          "h": 263.31,
          "l": 260.68,
          "o": 261.07,
          "pc": 259.45,
          "t": 1582641000 
        }`
      })

    // This one is missing price
    nock('https://finnhub.io/api/v1/quote')
      .get('?symbol=AAPL&token=API_TOKEN')
      .reply(200, function (_) {
        return `{
          "h": 263.31,
          "l": 260.68,
          "o": 261.07,
          "pc": 259.45,
          "t": 1582641000 
        }`
      })

    // This one is missing timestamp
    nock('https://finnhub.io/api/v1/quote')
      .get('?symbol=FB&token=API_TOKEN')
      .reply(200, function (_) {
        return `{
          "c": 336.59,
          "h": 263.31,
          "l": 260.68,
          "o": 261.07,
          "pc": 259.45
        }`
      })

    const finnhubbConfig: PriceSourceConfig = {
      symbols: ['TSLA', 'AAPL', 'FB']
    }

    const priceManager = new PriceManager(finnhubbConfig, new FinnhubbPriceProvider('API_TOKEN'))
    const prices = await priceManager.fetchAssetPrices()
    expect(prices.length).toStrictEqual(1)
    expect(prices[0].asset).toStrictEqual('TSLA')
    expect(prices[0].price).toStrictEqual(new BigNumber(605.14))
    expect(prices[0].timestamp).toStrictEqual(new BigNumber(1582641000000))
  })
})
