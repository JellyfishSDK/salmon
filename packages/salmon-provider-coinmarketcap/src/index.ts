import BigNumber from 'bignumber.js'
import { PriceProvider, AssetPrice } from '@defichain/salmon-price-functions'
import fetch from 'node-fetch'
import {
  JellyfishJSON
} from '@defichain/jellyfish-json'

const COINMARKETCAP_URL = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest'

/**
 * Fetches prices from Coinmarketcap
 */
export class CoinMarketCapPriceProvider implements PriceProvider {
  constructor (
    private readonly apiToken: string
  ) {
  }

  public async prices (symbols: string[]): Promise<AssetPrice[]> {
    const fetchPath = `${COINMARKETCAP_URL}?symbol=${symbols.join(',')}&CMC_PRO_API_KEY=${this.apiToken}`
    const response = await fetch(fetchPath, {
      method: 'GET'
    })

    const text = await response.text()
    const json = JellyfishJSON.parse(text, 'bignumber').data
    return Object.keys(json).map((asset: any) => {
      const data = json[asset]
      const timestamp = new BigNumber(Date.parse(data.last_updated))
      return {
        asset,
        price: new BigNumber(data.quote.USD.price),
        timestamp
      }
    })
  }
}
