import { PriceProvider, AssetPrice } from '@defichain/salmon-price-functions'
import fetch from 'node-fetch'
import BigNumber from 'bignumber.js'
import {
  JellyfishJSON
} from '@defichain/jellyfish-json'

const FINNHUBB_URL = 'https://finnhub.io/api/v1/quote'

/**
 * Fetches prices from Finnhubb
 * https://finnhub.io
 */
export class FinnhubbPriceProvider implements PriceProvider {
  constructor (
    private readonly apiToken: string
  ) {
  }

  private async fetchAsset (symbol: string): Promise<AssetPrice> {
    const fetchPath = `${FINNHUBB_URL}?symbol=${symbol}&token=${this.apiToken}`
    const response = await fetch(fetchPath, {
      method: 'GET'
    })

    const text = await response.text()
    const json = JellyfishJSON.parse(text, 'bignumber')

    return {
      asset: symbol,
      price: new BigNumber(json.c),
      timestamp: new BigNumber(json.t * 1000)
    }
  }

  public async prices (symbols: string[]): Promise<AssetPrice[]> {
    return await Promise.all(symbols.map(async symbol => {
      return await this.fetchAsset(symbol)
    }))
  }
}
