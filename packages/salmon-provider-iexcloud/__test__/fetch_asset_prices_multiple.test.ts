
import nock from 'nock'
import { PriceManager, PriceSourceConfig } from '@defichain/salmon-price-functions'
import { IexPriceProvider } from '../src'
import BigNumber from 'bignumber.js'

describe('multi price fetch', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should fetch price from iexcloud using config', async () => {
    const iexConfig: PriceSourceConfig = {
      symbols: ['TSLA', 'AAPL', 'FB']
    }

    nock('https://cloud.iexapis.com/stable/tops')
      .get('?symbols=TSLA,AAPL,FB&token=API_TOKEN')
      .reply(200, function (_) {
        return `[
          {
            "symbol":"TSLA",
            "sector":"consumerdurables",
            "securityType":"cs",
            "bidPrice":0,
            "bidSize":0,
            "askPrice":0,
            "askSize":0,
            "lastUpdated":1623096987115,
            "lastSalePrice":605.14,
            "lastSaleSize":10,
            "lastSaleTime":1623095998146,
            "volume":480662
          },
          {
            "symbol":"AAPL",
            "sector":"electronictechnology",
            "securityType":"cs",
            "bidPrice":0,
            "bidSize":0,
            "askPrice":0,
            "askSize":0,
            "lastUpdated":1623099600004,
            "lastSalePrice":126,
            "lastSaleSize":100,
            "lastSaleTime":1623097192802,
            "volume":1401779
          },
          {
            "symbol":"FB",
            "sector":"technologyservices",
            "securityType":"cs",
            "bidPrice":0,
            "bidSize":0,
            "askPrice":0,
            "askSize":0,
            "lastUpdated":1623097044336,
            "lastSalePrice":336.59,
            "lastSaleSize":15,
            "lastSaleTime":1623095999551,
            "volume":598873
          }
        ]`
      })

    const priceManager = new PriceManager(iexConfig, new IexPriceProvider('API_TOKEN'))
    const prices = await priceManager.fetchAssetPrices()
    expect(prices[0].asset).toStrictEqual('TSLA')
    expect(prices[0].price).toStrictEqual(new BigNumber(605.14))
    expect(prices[0].timestamp).toStrictEqual(new BigNumber(1623095998146))
    expect(prices[1].asset).toStrictEqual('AAPL')
    expect(prices[1].price).toStrictEqual(new BigNumber(126))
    expect(prices[1].timestamp).toStrictEqual(new BigNumber(1623097192802))
    expect(prices[2].asset).toStrictEqual('FB')
    expect(prices[2].price).toStrictEqual(new BigNumber(336.59))
    expect(prices[2].timestamp).toStrictEqual(new BigNumber(1623095999551))
  })
})
