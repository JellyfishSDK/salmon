interface TiingoSymbolMapping {
  ticker: string
  inverse: boolean
}

export const TIINGO_SYMBOL_MAPPING: Record<string, TiingoSymbolMapping> = {
  XAU: {
    ticker: 'xauusd',
    inverse: false
  },
  XAG: {
    ticker: 'xagusd',
    inverse: false
  },
  GBP: {
    ticker: 'gbpusd',
    inverse: false
  },
  EUR: {
    ticker: 'eurusd',
    inverse: false
  },
  SGD: {
    ticker: 'usdsgd',
    inverse: true
  }
}

export function symbolFromTicker (ticker: string): string | undefined {
  return Object.keys(TIINGO_SYMBOL_MAPPING).find(x =>
    TIINGO_SYMBOL_MAPPING[x].ticker === ticker
  )
}
