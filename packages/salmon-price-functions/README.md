# @defichain/salmon-price-functions

### Config

Configuration should follow the following structure:
```
export interface AssetConfig {
  symbol: string
  url: string
  jsonPath: string
}

export interface PriceSourceConfig {
  assets: AssetConfig[]
  apiToken: string
}
```

For example, for a source such as Finnhubb:
- Url: https://finnhub.io/api/v1/quote?symbol=AAPL
- Response:
```
{
  "c": 261.74, <<< we want this
  "h": 263.31,
  "l": 260.68,
  "o": 261.07,
  "pc": 259.45,
  "t": 1582641000 
}
```

This can be expressed as:
```
{
  apiToken: 'API_TOKEN',
  assets: [
    {
      symbol: 'AAPL',
      url: 'https://finnhub.io/api/v1/quote?symbol=AAPL',
      jsonPath: 'c' // this is the json path of the variable that contains the desired pricing data
    },
    {
      symbol: 'TSLA',
      url: 'https://finnhub.io/api/v1/quote?symbol=TSLA',
      jsonPath: 'c'
    }
  ]
}
```