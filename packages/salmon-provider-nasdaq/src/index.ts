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

  // This is slightly complex due to the fact that Eastern Time
  // undergoes daylight saving
  processTimestamp (timestamp: string): number {
    const priceDate = new Date(timestamp + 'Z')
    const dateNow = new Date()
    const paddMs = String(dateNow.getUTCMilliseconds()).padStart(3, '0')

    const localeDate = dateNow.toLocaleString('en-CA',
      {
        timeZone: 'America/New_York',
        hour12: false
      }).replace(', 24', ', 00')

    // en-CA instead of en-US is needed here ('-' vs '/')
    const dateNowEt = new Date(localeDate.replace(', ', 'T') + `.${paddMs}Z`)

    const timezoneOffset = dateNow.getTime() - dateNowEt.getTime()
    return priceDate.getTime() + timezoneOffset
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
    const priceObject = Array.isArray(json) ? json[0] : json
    const timestamp = new BigNumber(this.processTimestamp(priceObject.timestamp))

    return {
      asset: symbol,
      price: new BigNumber(priceObject.price),
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
