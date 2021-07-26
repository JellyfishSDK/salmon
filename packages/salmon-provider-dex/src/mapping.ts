import BigNumber from 'bignumber.js'
import fetch from 'node-fetch'
import {
  JellyfishJSON
} from '@defichain/jellyfish-json'

interface DefichainSymbolMapping {
  ticker: string
  inverse: boolean
  affector?: () => Promise<BigNumber>
}

export const DEFICHAIN_DEX_SYMBOL_MAPPING: Record<string, DefichainSymbolMapping> = {
  DFI: {
    ticker: 'BTC-DFI',
    inverse: false,
    affector: async () => {
      const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
      const response = await fetch(url, { method: 'GET' })
      const text = await response.text()
      const json = JellyfishJSON.parse(text, 'bignumber')
      return new BigNumber(json.bitcoin.usd)
    }
  }
}
