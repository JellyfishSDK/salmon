
import nock from 'nock'
import { PriceManager, PriceSourceConfig } from '@defichain/salmon-price-functions'
import { FinnhubbPriceProvider } from '../src'
import BigNumber from 'bignumber.js'

describe('single price fetch', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
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
      300000)
    expect(prices[0].asset).toStrictEqual('AAPL')
    expect(prices[0].price).toStrictEqual(new BigNumber(261.74))
    expect(prices[0].timestamp).toStrictEqual(new BigNumber(finnhubbResponse.t * 1000))

    nock.cleanAll()

    const dateOld = new Date(Date.now() - 600000)
    nock('https://finnhub.io/api/v1/quote')
      .get('?symbol=AAPL&token=API_TOKEN')
      .reply(200, function (_) {
        return JSON.stringify([{
          ...finnhubbResponse, t: dateOld.getTime() / 1000
        }])
      })

    const pricesOld = PriceManager.filterTimestamps(await priceManager.fetchAssetPrices(),
      300000)
    expect(pricesOld.length).toStrictEqual(0)
  })
})
