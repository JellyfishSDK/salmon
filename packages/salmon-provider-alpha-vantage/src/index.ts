import { PriceProvider, AssetPrice } from '@defichain/salmon-price-functions'
import fetch from 'node-fetch'
import BigNumber from 'bignumber.js'
import {
  JellyfishJSON
} from '@defichain/jellyfish-json'

const AV_URL = 'https://www.alphavantage.co/query'

/**
 * Fetches prices from Alpha Vantage
 * https://www.alphavantage.co/
 */
export class AlphaVantagePriceProvider implements PriceProvider {
  constructor (
    private readonly apiToken: string
  ) {
  }

  private async fetchAsset (symbol: string): Promise<AssetPrice> {
    const fetchPath = `${AV_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiToken}`
    const response = await fetch(fetchPath, {
      method: 'GET'
    })

    const text = await response.text()
    const json = JellyfishJSON.parse(text, 'bignumber')
    const priceObject = json['Global Quote']

    return {
      asset: symbol,
      price: new BigNumber(priceObject['05. price']),
      timestamp: new BigNumber(Date.now())
    }
  }

  public async prices (symbols: string[]): Promise<AssetPrice[]> {
    return await Promise.all(symbols.map(async symbol => {
      return await this.fetchAsset(symbol)
    }))
  }
}
