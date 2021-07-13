interface OandaSymbolMapping {
  symbol: string
  inverse: boolean
}

export const FINNHUBB_OANDA_SYMBOL_MAPPING: Record<string, OandaSymbolMapping> = {
  GOLD: {
    symbol: 'OANDA:XAU_USD',
    inverse: false
  },
  GBP: {
    symbol: 'OANDA:GBP_USD',
    inverse: false
  },
  EUR: {
    symbol: 'OANDA:EUR_USD',
    inverse: false
  },
  SGD: {
    symbol: 'OANDA:USD_SGD',
    inverse: true
  }
}
