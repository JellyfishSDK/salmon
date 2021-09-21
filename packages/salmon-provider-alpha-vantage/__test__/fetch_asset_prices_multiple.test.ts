
import nock from 'nock'
import { PriceManager, PriceSourceConfig } from '@defichain/salmon-price-functions'
import { AlphaVantagePriceProvider } from '../src'
import BigNumber from 'bignumber.js'

describe('multi price fetch', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should fetch price from alpha vantage using config', async () => {
    nock('https://www.alphavantage.co/query')
      .get('?function=GLOBAL_QUOTE&symbol=TSLA&apikey=API_TOKEN')
      .reply(200, function (_) {
        return `{
          "Global Quote": {
              "01. symbol": "TSLA",
              "02. open": "734.5577",
              "03. high": "742.0000",
              "04. low": "718.6249",
              "05. price": "730.1700",
              "06. volume": "24401846",
              "07. latest trading day": "2021-09-20",
              "08. previous close": "759.4900",
              "09. change": "-29.3200",
              "10. change percent": "-3.8605%"
          }
      }`
      })

    nock('https://www.alphavantage.co/query')
      .get('?function=GLOBAL_QUOTE&symbol=AAPL&apikey=API_TOKEN')
      .reply(200, function (_) {
        return `{
          "Global Quote": {
              "01. symbol": "AAPL",
              "02. open": "143.8000",
              "03. high": "144.8400",
              "04. low": "141.2700",
              "05. price": "142.9400",
              "06. volume": "123478863",
              "07. latest trading day": "2021-09-20",
              "08. previous close": "146.0600",
              "09. change": "-3.1200",
              "10. change percent": "-2.1361%"
          }
      }`
      })

    nock('https://www.alphavantage.co/query')
      .get('?function=GLOBAL_QUOTE&symbol=FB&apikey=API_TOKEN')
      .reply(200, function (_) {
        return `{
          "Global Quote": {
              "01. symbol": "FB",
              "02. open": "359.3000",
              "03. high": "361.0300",
              "04. low": "349.8000",
              "05. price": "355.7000",
              "06. volume": "19822772",
              "07. latest trading day": "2021-09-20",
              "08. previous close": "364.7200",
              "09. change": "-9.0200",
              "10. change percent": "-2.4731%"
          }
      }`
      })

    const config: PriceSourceConfig = {
      symbols: ['TSLA', 'AAPL', 'FB']
    }

    const priceManager = new PriceManager(config, new AlphaVantagePriceProvider('API_TOKEN'))
    const prices = await priceManager.fetchAssetPrices()
    expect(prices[0].asset).toStrictEqual('TSLA')
    expect(prices[0].price).toStrictEqual(new BigNumber(730.1700))
    expect(prices[1].asset).toStrictEqual('AAPL')
    expect(prices[1].price).toStrictEqual(new BigNumber(142.9400))
    expect(prices[2].asset).toStrictEqual('FB')
    expect(prices[2].price).toStrictEqual(new BigNumber(355.7000))
  })
})
