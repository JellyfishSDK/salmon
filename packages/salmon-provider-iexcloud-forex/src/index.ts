import { PriceProvider, AssetPrice } from '@defichain/salmon-price-functions'
import fetch from 'node-fetch'
import BigNumber from 'bignumber.js'
import {
  JellyfishJSON
} from '@defichain/jellyfish-json'
import { IEX_SYMBOL_MAPPING, symbolFromTicker } from './mapping'

const IEX_URL = 'https://cloud.iexapis.com/fx/latest'

/**
 * Fetches prices from IEX Cloud for forex
 * https://cloud.iexapis.com
 */
export class IexForexPriceProvider implements PriceProvider {
  constructor (
    private readonly apiToken: string
  ) {
  }

  public async prices (symbols: string[]): Promise<AssetPrice[]> {
    const tickers = symbols.map(x => IEX_SYMBOL_MAPPING[x].ticker)
    const fetchPath = `${IEX_URL}?symbols=${tickers.join(',')}&token=${this.apiToken}`
    const response = await fetch(fetchPath, {
      method: 'GET'
    })

    const text = await response.text()
    const json = JellyfishJSON.parse(text, 'bignumber')

    return json.map((x: any) => {
      const asset = symbolFromTicker(x.symbol)

      let price = new BigNumber(x.rate)
      if (asset !== undefined && IEX_SYMBOL_MAPPING[asset].inverse) {
        price = (new BigNumber(1)).div(price)
      }

      return {
        asset,
        price,
        timestamp: new BigNumber(x.timestamp)
      }
    })
  }
}
