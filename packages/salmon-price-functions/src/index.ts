import {
  JellyfishJSON
} from '@defichain/jellyfish-api-core'
import fetch from 'cross-fetch'
import BigNumber from 'bignumber.js'

export interface AssetConfig {
  symbol: string
  url: string
  jsonPath: string
}

export interface PriceSourceConfig {
  assets: AssetConfig[]
  apiToken: string
}

export interface AssetPrice {
  asset: string
  price: BigNumber
}

export class PriceManager {
  async fetchValueFromSource (url: string, jsonPath: string, apiToken?: string): Promise<BigNumber> {
    const response = await fetch(`${url}&token=${apiToken ?? ''}`, {
      method: 'GET',
      cache: 'no-cache'
    })

    const text = await response.text()
    const json = JellyfishJSON.parse(text, 'bignumber')

    var deepValue = function (obj: any, keyPath: string): any {
      for (var i = 0, path = keyPath.split('.'), len = path.length; i < len; i++) {
        obj = obj[path[i]]
      };
      return obj
    }

    return new BigNumber(deepValue(Array.isArray(json) ? json[0] : json, jsonPath))
  }

  async fetchAssetPrices (config: PriceSourceConfig): Promise<AssetPrice[]> {
    return await Promise.all(config.assets.map(async asset => {
      const price = await this.fetchValueFromSource(asset.url, asset.jsonPath, config.apiToken)
      return { asset: asset.symbol, price }
    }))
  }
}
