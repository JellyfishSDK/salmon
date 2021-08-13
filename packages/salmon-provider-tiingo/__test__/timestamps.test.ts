
import nock from 'nock'
import { PriceManager, PriceSourceConfig } from '@defichain/salmon-price-functions'
import { TiingoPriceProvider } from '../src'
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
      300000, new Date(tiingoResponse[0].lastSaleTimestamp))
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
      300000, new Date(tiingoResponse[0].lastSaleTimestamp))
    expect(pricesOld.length).toStrictEqual(0)
  })
})
