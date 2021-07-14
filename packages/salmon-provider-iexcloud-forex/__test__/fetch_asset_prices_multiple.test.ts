
import nock from 'nock'
import { PriceManager, PriceSourceConfig } from '@defichain/salmon-price-functions'
import { IexForexPriceProvider } from '../src'
import BigNumber from 'bignumber.js'

describe('multi price fetch', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should fetch price from iexcloud using config', async () => {
    const iexConfig: PriceSourceConfig = {
      symbols: ['CAD', 'GBP', 'JPY']
    }

    nock('https://cloud.iexapis.com/fx/latest')
      .get('?symbols=USDCAD,USDGBP,USDJPY&token=API_TOKEN')
      .reply(200, function (_) {
        return `[ 
          {
            "symbol": "USDCAD",
            "rate": 1.31,
            "timestamp":  1288282222000
          },
          {
            "symbol": "USDGBP",
            "rate": 0.755,
            "timestamp":  1288282222000
          },
          {
            "symbol": "USDJPY",
            "rate": 100.43,
            "timestamp":  1288282222000
          }
        ]`
      })

    const priceManager = new PriceManager(iexConfig, new IexForexPriceProvider('API_TOKEN'))
    const prices = await priceManager.fetchAssetPrices()
    expect(prices[0].asset).toStrictEqual('CAD')
    expect(prices[0].price).toStrictEqual(new BigNumber(1).div(new BigNumber(1.31)))
    expect(prices[0].timestamp).toStrictEqual(new BigNumber(1288282222000))
    expect(prices[1].asset).toStrictEqual('GBP')
    expect(prices[1].price).toStrictEqual(new BigNumber(1).div(new BigNumber(0.755)))
    expect(prices[1].timestamp).toStrictEqual(new BigNumber(1288282222000))
    expect(prices[2].asset).toStrictEqual('JPY')
    expect(prices[2].price).toStrictEqual(new BigNumber(1).div(new BigNumber(100.43)))
    expect(prices[2].timestamp).toStrictEqual(new BigNumber(1288282222000))
  })
})
