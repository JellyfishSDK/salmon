import nock from 'nock'

const tiingoResponse = `[
  {
  "bidPrice":null,
  "last":606,
  "quoteTimestamp":"2021-06-07T20:00:00+00:00",
  "bidSize":null,
  "high":610.0,
  "timestamp":"2021-06-07T20:00:00+00:00",
  "tngoLast":605.13,
  "lastSize":null,
  "askSize":null,
  "ticker":"TSLA",
  "askPrice":null,
  "low":582.88,
  "open":591.825,
  "prevClose":599.05,
  "mid":null,
  "lastSaleTimestamp": "${(new Date()).toISOString()}",
  "volume":22543682
  },
  {
  "last":120,
  "bidPrice":null,
  "quoteTimestamp":"2021-06-07T20:00:00+00:00",
  "lastSize":null,
  "open":126.17,
  "timestamp":"2021-06-07T20:00:00+00:00",
  "tngoLast":125.9,
  "bidSize":null,
  "askSize":null,
  "ticker":"AAPL",
  "askPrice":null,
  "low":124.8321,
  "high":126.32,
  "prevClose":125.89,
  "mid":null,
  "lastSaleTimestamp": "${(new Date()).toISOString()}",
  "volume":71057550
  },
  {
  "last":340,
  "bidPrice":null,
  "quoteTimestamp":"2021-06-07T20:00:00+00:00",
  "lastSize":null,
  "open":329.48,
  "timestamp":"2021-06-07T20:00:00+00:00",
  "tngoLast":336.58,
  "bidSize":null,
  "askSize":null,
  "ticker":"FB",
  "askPrice":null,
  "low":328.93,
  "high":337.69,
  "prevClose":330.35,
  "mid":null,
  "lastSaleTimestamp": "${(new Date()).toISOString()}",
  "volume":20136707
  }
]`

export const mockTiingoEndpoints = (): void => {
  nock('https://api.tiingo.com/iex')
    .get('/?tickers=TSLA,AAPL,FB&token=API_TOKEN')
    .reply(200, function (_) {
      return tiingoResponse
    })
}
