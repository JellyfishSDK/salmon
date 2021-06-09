import { PriceProvider, AssetPrice } from '../price_provider'
import fetch from 'cross-fetch'
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
    const apiToken = this.apiToken
    const fetchPath = `${TIINGO_URL}?tickers=${symbols.join(',')}&token=${apiToken}`
    const response = await fetch(fetchPath, {
      method: 'GET',
      cache: 'no-cache'
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
