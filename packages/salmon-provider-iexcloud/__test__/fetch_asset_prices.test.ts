
import nock from 'nock'
import { PriceManager, PriceSourceConfig } from '@defichain/salmon-price-functions'
import { IexPriceProvider } from '../src'
import BigNumber from 'bignumber.js'

describe('single price fetch', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should fetch price from iexcloud using config', async () => {
    nock('https://cloud.iexapis.com/stable/tops')
      .get('?symbols=FB&token=API_TOKEN')
      .reply(200, function (_) {
        return `[
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

  it('complain if symbol list is empty', async () => {
    const badConfig: PriceSourceConfig = {
      symbols: []
    }

    await expect(async () => {
      const priceManager = new PriceManager(badConfig, new IexPriceProvider('API_TOKEN'))
      await priceManager.fetchAssetPrices()
    }).rejects.toThrow('Symbol list cannot be empty')
  })

  it('should throw when receiving malformed data', async () => {
    nock('https://cloud.iexapis.com/stable/tops')
      .get('?symbols=FB&token=API_TOKEN')
      .reply(500, function (_) {
        return 'Error'
      })

    const priceManager = new PriceManager({ symbols: ['FB'] }, new IexPriceProvider('API_TOKEN'))
    await expect(async () => {
      await priceManager.fetchAssetPrices()
    }).rejects.toThrow(SyntaxError)
  })
})
