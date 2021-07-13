import { PriceProvider, AssetPrice } from '@defichain/salmon-price-functions'
import fetch from 'node-fetch'
import BigNumber from 'bignumber.js'
import {
  JellyfishJSON
} from '@defichain/jellyfish-json'
import { FINNHUBB_OANDA_SYMBOL_MAPPING } from './mapping'

const FINNHUBB_URL = 'https://finnhub.io/api/v1/forex/candle'
const CANDLE_RES = 5

/**
 * Fetches forex prices from Finnhubb
 * https://finnhub.io
 */
export class FinnhubbForexPriceProvider implements PriceProvider {
  constructor (
    private readonly apiToken: string
  ) {
  }

  private async fetchAsset (symbol: string): Promise<AssetPrice> {
    const interval = parseInt(process.env.INTERVAL_SECONDS ?? '300')
    const tNow = Math.floor(Date.now() / 1000)
    const tPrev = tNow - interval
    const oandaSymbol = FINNHUBB_OANDA_SYMBOL_MAPPING[symbol].symbol

    const fetchPath = `${FINNHUBB_URL}?symbol=${oandaSymbol}&resolution=${CANDLE_RES}&token=${this.apiToken}&from=${tPrev}&to=${tNow}`
    const response = await fetch(fetchPath, {
      method: 'GET'
    })

    const text = await response.text()
    const json = JellyfishJSON.parse(text, 'bignumber')

    let price = new BigNumber(json.c.slice(-1))
    if (FINNHUBB_OANDA_SYMBOL_MAPPING[symbol].inverse) {
      price = new BigNumber(1).div(price)
    }

    return {
      asset: symbol,
      price,
      timestamp: (new BigNumber(json.t.slice(-1))).multipliedBy(1000)
    }
  }

  public async prices (symbols: string[]): Promise<AssetPrice[]> {
    return await Promise.all(symbols.map(async symbol => {
      return await this.fetchAsset(symbol)
    }))
  }
}
