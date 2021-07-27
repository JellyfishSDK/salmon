import BigNumber from 'bignumber.js'
import { PriceProvider, AssetPrice } from '@defichain/salmon-price-functions'
import { COINGECKO_SYMBOL_MAPPING } from './mapping'
import fetch from 'node-fetch'
import {
  JellyfishJSON
} from '@defichain/jellyfish-json'

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price'

/**
 * Fetches prices from Coingecko
 */
export class CoingeckoPriceProvider implements PriceProvider {
  public async prices (symbols: string[]): Promise<AssetPrice[]> {
    const fetchPath = `${COINGECKO_URL}?ids=${symbols
      .map(x => COINGECKO_SYMBOL_MAPPING[x].ticker).join(',')}&vs_currencies=usd`
    const response = await fetch(fetchPath, {
      method: 'GET'
    })

    const text = await response.text()
    const json = JellyfishJSON.parse(text, 'bignumber')
    const assets = symbols.map(asset => (
      {
        price: new BigNumber(json[COINGECKO_SYMBOL_MAPPING[asset].ticker].usd),
        asset,
        timestamp: new BigNumber(Date.now())
      }
    ))

    return assets
  }
}
