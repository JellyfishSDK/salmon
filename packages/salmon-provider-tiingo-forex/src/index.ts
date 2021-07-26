import { PriceProvider, AssetPrice } from '@defichain/salmon-price-functions'
import fetch from 'node-fetch'
import BigNumber from 'bignumber.js'
import {
  JellyfishJSON
} from '@defichain/jellyfish-json'
import { symbolFromTicker, TIINGO_SYMBOL_MAPPING } from './mapping'

const TIINGO_URL = 'https://api.tiingo.com/tiingo/fx/top'

/**
 * Fetches forex prices from Tiingo
 * https://api.tiingo.com
 */
export class TiingoForexPriceProvider implements PriceProvider {
  constructor (
    private readonly apiToken: string
  ) {
  }

  public async prices (symbols: string[]): Promise<AssetPrice[]> {
    const tickers = symbols.map(x => TIINGO_SYMBOL_MAPPING[x].ticker)
    const fetchPath = `${TIINGO_URL}?tickers=${tickers.join(',')}&token=${this.apiToken}`
    const response = await fetch(fetchPath, {
      method: 'GET'
    })

    const text = await response.text()
    const json = JellyfishJSON.parse(text, 'bignumber')

    return json.map((x: any, i: number) => {
      const timestamp = Date.parse(x.quoteTimestamp)
      let price = new BigNumber(x.midPrice)
      const asset = symbolFromTicker(x.ticker)

      if (asset !== undefined && TIINGO_SYMBOL_MAPPING[asset].inverse) {
        price = (new BigNumber(1)).div(price)
      }

      return {
        asset,
        price,
        timestamp: new BigNumber(timestamp)
      }
    })
  }
}
