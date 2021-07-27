interface CoingeckoSymbolMapping {
  ticker: string
  inverse: boolean
}

export const COINGECKO_SYMBOL_MAPPING: Record<string, CoingeckoSymbolMapping> = {
  BTC: {
    ticker: 'bitcoin',
    inverse: false
  }
}
