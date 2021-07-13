interface OandaSymbolMapping {
  ticker: string
  inverse: boolean
}

export const FINNHUBB_OANDA_SYMBOL_MAPPING: Record<string, OandaSymbolMapping> = {
  GOLD: {
    ticker: 'OANDA:XAU_USD',
    inverse: false
  },
  GBP: {
    ticker: 'OANDA:GBP_USD',
    inverse: false
  },
  EUR: {
    ticker: 'OANDA:EUR_USD',
    inverse: false
  },
  SGD: {
    ticker: 'OANDA:USD_SGD',
    inverse: true
  }
}
