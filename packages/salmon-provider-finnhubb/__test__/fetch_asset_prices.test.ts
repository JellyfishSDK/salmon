
import nock from 'nock'
import { PriceManager, PriceSourceConfig } from '@defichain/salmon-price-functions'
import { FinnhubbPriceProvider } from '../src'
import BigNumber from 'bignumber.js'

describe('single price fetch', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should fetch price from finnhubb using config', async () => {
    nock('https://finnhub.io/api/v1/quote')
      .get('?symbol=AAPL&token=API_TOKEN')
      .reply(200, function (_) {
        return `{
          "c": 261.74,
          "h": 263.31,
          "l": 260.68,
          "o": 261.07,
          "pc": 259.45,
          "t": 1582641000 
        }`
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

  it('should throw when receiving malformed data', async () => {
    nock('https://finnhub.io/api/v1/quote')
      .get('?symbol=AAPL&token=API_TOKEN')
      .reply(500, function (_) {
        return 'Error'
      })

    const priceManager = new PriceManager({ symbols: ['AAPL'] }, new FinnhubbPriceProvider('API_TOKEN'))
    await expect(async () => {
      await priceManager.fetchAssetPrices()
    }).rejects.toThrow(SyntaxError)
  })
})
