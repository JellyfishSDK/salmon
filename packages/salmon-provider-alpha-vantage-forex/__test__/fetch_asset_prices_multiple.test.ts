
import nock from 'nock'
import { PriceManager, PriceSourceConfig } from '@defichain/salmon-price-functions'
import { AlphaVantageForexPriceProvider } from '../src'
import BigNumber from 'bignumber.js'

describe('multi price fetch', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should fetch price from alpha vantage using config', async () => {
    nock('https://www.alphavantage.co/query')
      .get('?function=CURRENCY_EXCHANGE_RATE&symbol=XAU&apikey=API_TOKEN')
      .reply(200, function (_) {
        return `{
          "Realtime Currency Exchange Rate": {
              "1. From_Currency Code": "XAU",
              "2. From_Currency Name": null,
              "3. To_Currency Code": "USD",
              "4. To_Currency Name": "United States Dollar",
              "5. Exchange Rate": "1751.89450000",
              "6. Last Refreshed": "2021-10-06 04:24:01",
              "7. Time Zone": "UTC",
              "8. Bid Price": "1751.89450000",
              "9. Ask Price": "1751.89450000"
          }
      }`
      })

    nock('https://www.alphavantage.co/query')
      .get('?function=CURRENCY_EXCHANGE_RATE&symbol=XAG&apikey=API_TOKEN')
      .reply(200, function (_) {
        return `{
          "Realtime Currency Exchange Rate": {
              "1. From_Currency Code": "XAG",
              "2. From_Currency Name": null,
              "3. To_Currency Code": "USD",
              "4. To_Currency Name": "United States Dollar",
              "5. Exchange Rate": "22.41795000",
              "6. Last Refreshed": "2021-10-06 04:31:01",
              "7. Time Zone": "UTC",
              "8. Bid Price": "22.41795000",
              "9. Ask Price": "22.41795000"
          }
      }`
      })

    const config: PriceSourceConfig = {
      symbols: ['XAU', 'XAG']
    }

    const priceManager = new PriceManager(config, new AlphaVantageForexPriceProvider('API_TOKEN'))
    const prices = await priceManager.fetchAssetPrices()
    expect(prices[0].asset).toStrictEqual('XAU')
    expect(prices[0].price).toStrictEqual(new BigNumber(1751.89450000))
    expect(prices[1].asset).toStrictEqual('XAG')
    expect(prices[1].price).toStrictEqual(new BigNumber(22.41795000))
  })
})
