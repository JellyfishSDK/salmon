interface CoingeckoSymbolMapping {
  ticker: string
}

export const COINGECKO_SYMBOL_MAPPING: Record<string, CoingeckoSymbolMapping> = {
  BTC: {
    ticker: 'bitcoin'
  },
  DFI: {
    ticker: 'defichain'
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
  },
  USDT: {
    ticker: 'tether'
  },
  USDC: {
    ticker: 'usd-coin'
  }
}
