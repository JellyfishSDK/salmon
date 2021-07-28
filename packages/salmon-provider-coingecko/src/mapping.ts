interface CoingeckoSymbolMapping {
  ticker: string
}

export const COINGECKO_SYMBOL_MAPPING: Record<string, CoingeckoSymbolMapping> = {
  BTC: {
    ticker: 'bitcoin'
  },
  ETH: {
    ticker: 'ethereum'
  },
  DOGE: {
    ticker: 'dogecoin'
  },
  BCH: {
    ticker: 'bitcoin-cash'
  },
  LTC: {
    ticker: 'litecoin'
  }
}
