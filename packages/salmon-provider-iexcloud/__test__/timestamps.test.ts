
import nock from 'nock'
import { PriceManager, PriceSourceConfig } from '@defichain/salmon-price-functions'
import { IexPriceProvider } from '../src'
import BigNumber from 'bignumber.js'

describe('single price fetch', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
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
      300000)
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
      300000)
    expect(pricesOld.length).toStrictEqual(0)
  })
})
