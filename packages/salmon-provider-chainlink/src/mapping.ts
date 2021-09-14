interface ChainlinkSymbolMapping {
  ticker: string
  inverse: boolean
}

export const CHAINLINK_SYMBOL_MAPPING: Record<string, ChainlinkSymbolMapping> = {
  ETH: {
    ticker: '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419',
    inverse: false
  },
  BTC: {
    ticker: '0xf4030086522a5beea4988f8ca5b36dbc97bee88c',
    inverse: false
  },
  LTC: {
    ticker: '0x6af09df7563c363b5763b9102712ebed3b9e859b',
    inverse: false
  },
  DOGE: {
    ticker: '0x2465cefd3b488be410b941b1d4b2767088e2a028',
    inverse: false
  },
  BCH: {
    ticker: '0x9f0f69428f923d6c95b781f89e165c9b2df9789d',
    inverse: false
  }
}
