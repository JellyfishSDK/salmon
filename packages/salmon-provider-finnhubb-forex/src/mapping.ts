interface OandaSymbolMapping {
  ticker: string
  inverse: boolean
}

export const FINNHUBB_OANDA_SYMBOL_MAPPING: Record<string, OandaSymbolMapping> = {
  XAU: {
    ticker: 'OANDA:XAU_USD',
    inverse: false
  },
  XCU: {
    ticker: 'OANDA:XCU_USD',
    inverse: false
  },
  XAG: {
    ticker: 'OANDA:XAG_USD',
    inverse: false
  },
  BCO: {
    ticker: 'OANDA:BCO_USD',
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
