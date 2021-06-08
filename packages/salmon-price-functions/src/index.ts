/* eslint @typescript-eslint/strict-boolean-expressions: 0 */
import {
  JellyfishJSON
} from '@defichain/jellyfish-api-core'
import fetch from 'cross-fetch'
import BigNumber from 'bignumber.js'

export interface PriceSourceConfig {
  baseUrl: string
  apiToken: string
  symbolQuery: string
  pricePath: string
  symbolPath?: string
  symbols: string[]
  splitRequests?: boolean
}

export interface AssetPrice {
  asset: string
  price: BigNumber
}

function deepValue (obj: any, keyPath: string): any {
  for (let i = 0, path = keyPath.split('.'), len = path.length; i < len; i++) {
    obj = obj[path[i]]
  };
  return obj
}
export class PriceManager {
  private async fetchMultipleAssets (config: PriceSourceConfig): Promise<AssetPrice[]> {
    const url = config.baseUrl
    const symbolQuery = config.symbolQuery
    const symbols = config.symbols
    const apiToken = config.apiToken
    const fetchPath = `${url}?${symbolQuery}=${symbols.join(',')}&token=${apiToken ?? ''}`
    const response = await fetch(fetchPath, {
      method: 'GET',
      cache: 'no-cache'
    })

    const text = await response.text()
    const json = JellyfishJSON.parse(text, 'bignumber')

    if (Array.isArray(json)) {
      return json.map((x, i) => {
        const asset = config.symbolPath ? deepValue(x, config.symbolPath) : symbols[i]
        return { asset, price: deepValue(x, config.pricePath) }
      })
    }

    const price = new BigNumber(deepValue(json, config.pricePath))
    const asset = config.symbolPath ? deepValue(json, config.symbolPath) : symbols[0]
    return [{ asset, price }]
  }

  public async fetchAssetPrices (config: PriceSourceConfig): Promise<AssetPrice[]> {
    if (config.splitRequests) {
      return await Promise.all(config.symbols.map(async symbol => {
        const singleConfig = { ...config, symbols: [symbol] }
        return (await this.fetchMultipleAssets(singleConfig))[0]
      }))
    } else {
      return await this.fetchMultipleAssets(config)
    }
  }
}
