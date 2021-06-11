import { PriceProvider, AssetPrice } from '../price_provider'
import fetch from 'node-fetch'
import BigNumber from 'bignumber.js'
import {
  JellyfishJSON
} from '@defichain/jellyfish-api-core'

const TIINGO_URL = 'https://api.tiingo.com/iex/'

/**
 * Fetches prices from Tiingo
 * https://api.tiingo.com
 */
export class TiingoPriceProvider implements PriceProvider {
  constructor (
    private readonly apiToken: string
  ) {
  }

  public async prices (symbols: string[]): Promise<AssetPrice[]> {
    const fetchPath = `${TIINGO_URL}?tickers=${symbols.join(',')}&token=${this.apiToken}`
    const response = await fetch(fetchPath, {
      method: 'GET'
    })

    const text = await response.text()
    const json = JellyfishJSON.parse(text, 'bignumber')

    return json.map((x: any) => {
      const timestamp = Date.parse(x.lastSaleTimestamp)
      return {
        asset: x.ticker,
        price: new BigNumber(x.last),
        timestamp: new BigNumber(timestamp)
      }
    })
  }
}
