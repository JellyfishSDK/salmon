
import nock from 'nock'
import { PriceManager, PriceSourceConfig } from '@defichain/salmon-price-functions'
import { FinnhubbForexPriceProvider } from '../src'
import BigNumber from 'bignumber.js'

describe('multi price fetch', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should fetch price from finnhubb using config', async () => {
    nock('https://finnhub.io/api/v1/quote')
      .get('?symbol=AAPL&token=API_TOKEN')
      .reply(200, function (_) {
        return `{
          "c": [
            1802.56,
            1802.532
          ],
          "h": [
            1802.97,
            1802.94
          ],
          "l": [
            1802.367,
            1802.215
          ],
          "o": [
            1802.97,
            1802.51
          ],
          "s": "ok",
          "t": [
            1625805600,
            1625805900
          ],
          "v": [
            36,
            103
          ]
        }`
      })

    nock('https://finnhub.io/api/v1/quote')
      .get('?symbol=FB&token=API_TOKEN')
      .reply(200, function (_) {
        return `{
          "c": [
            1.3542,
            1.35424
          ],
          "h": [
            1.35424,
            1.35433
          ],
          "l": [
            1.35414,
            1.35416
          ],
          "o": [
            1.35417,
            1.3542
          ],
          "s": "ok",
          "t": [
            1625805600,
            1625805900
          ],
          "v": [
            85,
            90
          ]
        }`
      })

    nock('https://finnhub.io/api/v1/quote')
      .get('?symbol=TSLA&token=API_TOKEN')
      .reply(200, function (_) {
        return `{
          "c": [
            1.37725,
            1.37748
          ],
          "h": [
            1.37739,
            1.37748
          ],
          "l": [
            1.37725,
            1.37714
          ],
          "o": [
            1.37733,
            1.37727
          ],
          "s": "ok",
          "t": [
            1625805600,
            1625805900
          ],
          "v": [
            55,
            84
          ]
        }`
      })

    const finnhubbConfig: PriceSourceConfig = {
      symbols: ['GOLD', 'GBP', 'SGD']
    }

    const priceManager = new PriceManager(finnhubbConfig, new FinnhubbForexPriceProvider('API_TOKEN'))
    const prices = await priceManager.fetchAssetPrices()
    expect(prices[0].asset).toStrictEqual('GOLD')
    expect(prices[0].price).toStrictEqual(new BigNumber(605.14))
    expect(prices[1].asset).toStrictEqual('GBP')
    expect(prices[1].price).toStrictEqual(new BigNumber(126))
    expect(prices[2].asset).toStrictEqual('SGD')
    expect(prices[2].price).toStrictEqual(new BigNumber(336.59))
  })
})
