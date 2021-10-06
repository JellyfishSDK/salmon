import { PriceProvider, AssetPrice } from '@defichain/salmon-price-functions'
import fetch from 'node-fetch'
import BigNumber from 'bignumber.js'
import {
  JellyfishJSON
} from '@defichain/jellyfish-json'

const AV_URL = 'https://www.alphavantage.co/query'

/**
 * Fetches prices from Alpha Vantage Forex
 * https://www.alphavantage.co/
 */
export class AlphaVantageForexPriceProvider implements PriceProvider {
  constructor (
    private readonly apiToken: string
  ) {
  }

  private async fetchAsset (symbol: string): Promise<AssetPrice> {
    const fetchPath = `${AV_URL}?function=CURRENCY_EXCHANGE_RATE&symbol=${symbol}&apikey=${this.apiToken}`
    const response = await fetch(fetchPath, {
      method: 'GET'
    })

    const text = await response.text()
    const json = JellyfishJSON.parse(text, 'bignumber')
    const priceObject = json['Realtime Currency Exchange Rate']

    return {
      asset: symbol,
      price: new BigNumber(priceObject['5. Exchange Rate']),
      timestamp: new BigNumber(Date.now())
    }
  }

  public async prices (symbols: string[]): Promise<AssetPrice[]> {
    return await Promise.all(symbols.map(async symbol => {
      return await this.fetchAsset(symbol)
    }))
  }
}
