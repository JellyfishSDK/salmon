import { PriceProvider, AssetPrice } from '@defichain/salmon-price-functions'
import fetch from 'node-fetch'
import BigNumber from 'bignumber.js'
import {
  JellyfishJSON
} from '@defichain/jellyfish-json'
import { DEFICHAIN_DEX_SYMBOL_MAPPING } from './mapping'

const DEX_URL = 'https://ocean.defichain.com/v0/mainnet/poolpairs'

/**
 * Fetches prices from Defichain DEX
 */
export class DexPriceProvider implements PriceProvider {
  private async fetchAsset (asset: string, json: any): Promise<AssetPrice> {
    const data = json.find((y: any) =>
      y.symbol === DEFICHAIN_DEX_SYMBOL_MAPPING[asset].ticker)

    const tokenA = new BigNumber(DEFICHAIN_DEX_SYMBOL_MAPPING[asset].inverse
      ? data.tokenB.reserve : data.tokenA.reserve)
    const tokenB = new BigNumber(DEFICHAIN_DEX_SYMBOL_MAPPING[asset].inverse
      ? data.tokenA.reserve : data.tokenB.reserve)
    let price = tokenA.div(tokenB)

    const affector = DEFICHAIN_DEX_SYMBOL_MAPPING[asset].affector
    if (affector !== undefined) {
      price = price.multipliedBy(await affector())
    }

    return {
      asset,
      price,
      timestamp: new BigNumber(Date.now())
    }
  }

  public async prices (symbols: string[]): Promise<AssetPrice[]> {
    const response = await fetch(DEX_URL, {
      method: 'GET'
    })

    const text = await response.text()
    const json = JellyfishJSON.parse(text, 'bignumber').data
    return await Promise.all(symbols.map(async symbol => {
      return await this.fetchAsset(symbol, json)
    }))
  }
}
