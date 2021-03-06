import { PriceProvider, AssetPrice } from '@defichain/salmon-price-functions'
import fetch from 'node-fetch'
import BigNumber from 'bignumber.js'
import {
  JellyfishJSON
} from '@defichain/jellyfish-json'

const IEX_URL = 'https://cloud.iexapis.com/stable/tops'

/**
 * Fetches prices from IEX Cloud
 * https://cloud.iexapis.com
 */
export class IexPriceProvider implements PriceProvider {
  constructor (
    private readonly apiToken: string
  ) {
  }

  public async prices (symbols: string[]): Promise<AssetPrice[]> {
    const fetchPath = `${IEX_URL}?symbols=${symbols.join(',')}&token=${this.apiToken}`
    const response = await fetch(fetchPath, {
      method: 'GET'
    })

    const text = await response.text()
    const json = JellyfishJSON.parse(text, 'bignumber')

    return json.map((x: any) => {
      const timestamp = x.lastSaleTime
      return {
        asset: x.symbol,
        price: new BigNumber(x.lastSalePrice),
        timestamp: new BigNumber(timestamp)
      }
    })
  }
}
