import {
  JellyfishJSON
} from '@defichain/jellyfish-api-core'
import fetch from 'cross-fetch'

export class PriceManager {
  async fetchValueFromSource (url: string, jsonPath: string, apiKey?: string): Promise<string> {
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

    return deepValue(Array.isArray(json) ? json[0] : json, jsonPath)
  }
}
