interface IexSymbolMapping {
  ticker: string
  inverse: boolean
}

export const IEX_SYMBOL_MAPPING: Record<string, IexSymbolMapping> = {
  CAD: {
    ticker: 'USDCAD',
    inverse: true
  },
  GBP: {
    ticker: 'USDGBP',
    inverse: true
  },
  JPY: {
    ticker: 'USDJPY',
    inverse: true
  },
  SGD: {
    ticker: 'USDSGD',
    inverse: true
  },
  EUR: {
    ticker: 'USDEUR',
    inverse: true
  }
}

export function symbolFromTicker (ticker: string): string | undefined {
  return Object.keys(IEX_SYMBOL_MAPPING).find(x =>
    IEX_SYMBOL_MAPPING[x].ticker === ticker
  )
}
