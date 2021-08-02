
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
    nock('https://api.coingecko.com')
      .get('/api/v3/simple/price?ids=bitcoin,ethereum,dogecoin&vs_currencies=usd')
      .reply(200, function (_) {
        return `{
          "dogecoin":{
             "usd":0.208377
          },
          "ethereum":{
             "usd":2299.23
          },
          "bitcoin":{
             "usd":39877
          }
        }`
      })

    const config: PriceSourceConfig = {
      symbols: ['BTC', 'ETH', 'DOGE']
    }

    const priceManager = new PriceManager(config, new CoingeckoPriceProvider())
    const prices = await priceManager.fetchAssetPrices()
    expect(prices[0].asset).toStrictEqual('BTC')
    expect(prices[0].price).toStrictEqual(new BigNumber('39877'))
    expect(prices[1].asset).toStrictEqual('ETH')
    expect(prices[1].price).toStrictEqual(new BigNumber('2299.23'))
    expect(prices[2].asset).toStrictEqual('DOGE')
    expect(prices[2].price).toStrictEqual(new BigNumber('0.208377'))

    const filteredPrices = PriceManager.filterTimestamps(prices, new Date(300000))
    expect(filteredPrices.length).toStrictEqual(3)
  })
})
