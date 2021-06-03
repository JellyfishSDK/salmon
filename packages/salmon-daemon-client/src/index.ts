import {
  JellyfishJSON
} from '@defichain/jellyfish-api-core'
import fetch from 'cross-fetch'
import BigNumber from 'bignumber.js'

export class PriceManager {
  async fetchValueFromSource (url: string, jsonPath: string, apiKey?: string): Promise<BigNumber> {
    const response = await fetch(url, {
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
}
