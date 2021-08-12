import { PriceProvider, AssetPrice } from '@defichain/salmon-price-functions'
import fetch from 'node-fetch'
import BigNumber from 'bignumber.js'
import {
  JellyfishJSON
} from '@defichain/jellyfish-json'

const API_VERSION = 'v1'
const BASE_URL = `https://restapi.clouddataservice.nasdaq.com/${API_VERSION}/nasdaq/realtime/equities/lastsale`
const AUTH_URL = `https://restapi.clouddataservice.nasdaq.com/${API_VERSION}/auth/token`

/**
 * Fetches prices from Nasdaq
 * https://nasdaq.com
 */
export class NasdaqPriceProvider implements PriceProvider {
  constructor (
    private readonly apiToken: string
  ) {
  }

  // This converts from EST (Eastern Standard Time) to UTC
  processTimestamp (timestamp: string): number {
    const timezoneOffset = 5 * 60 * 60 * 1000 // 5 hours
    return new Date(timestamp + 'Z').getTime() + timezoneOffset
  }

  private async fetchAsset (symbol: string, authToken: string): Promise<AssetPrice> {
    const fetchPath = `${BASE_URL}/${symbol}`
    const response = await fetch(fetchPath, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    })

    const text = await response.text()
    const json = JellyfishJSON.parse(text, 'bignumber')

    const timestamp = new BigNumber(this.processTimestamp(json.timestamp))

    return {
      asset: symbol,
      price: new BigNumber(json.price),
      timestamp
    }
  }

  public async prices (symbols: string[]): Promise<AssetPrice[]> {
    // Fetch auth token first
    const clientIdSecret = this.apiToken.split(':')

    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientIdSecret[0],
        client_secret: clientIdSecret[1]
      })
    })

    const text = await response.text()
    const json = JellyfishJSON.parse(text, 'bignumber')
    const authToken = json.access_token

    return await Promise.all(symbols.map(async symbol => {
      return await this.fetchAsset(symbol, authToken)
    }))
  }
}
