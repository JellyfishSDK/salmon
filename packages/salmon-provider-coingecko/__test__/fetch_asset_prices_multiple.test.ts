
import nock from 'nock'
import { PriceManager, PriceSourceConfig } from '@defichain/salmon-price-functions'
import { CoingeckoPriceProvider } from '../src'
import BigNumber from 'bignumber.js'

describe('multi price fetch', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should fetch price from defichain dex using config', async () => {
    const dexConfig: PriceSourceConfig = {
      symbols: ['BTC']
    }

    nock('https://api.coingecko.com')
      .get('/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
      .reply(200, function (_) {
        return `{
          "bitcoin": {
            "usd": 32436
          }
        }`
      })

    const priceManager = new PriceManager(dexConfig, new CoingeckoPriceProvider())
    const prices = await priceManager.fetchAssetPrices()
    expect(prices[0].asset).toStrictEqual('BTC')
    expect(prices[0].price).toStrictEqual(new BigNumber('32436'))

    const filteredPrices = PriceManager.filterTimestamps(prices, new Date(300000))
    expect(filteredPrices.length).toStrictEqual(1)
  })
})
