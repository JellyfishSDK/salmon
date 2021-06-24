const nock = require('nock')

exports.mockFinnhubbEndpoints = () => {
nock('https://finnhub.io/api/v1/quote')
  .get('?symbol=TSLA&token=API_TOKEN')
  .reply(200, function (_) {
    return `{
      "c": 605,
      "h": 263.31,
      "l": 260.68,
      "o": 261.07,
      "pc": 259.45,
      "t": ${Math.floor(Date.now() / 1000)} 
    }`
  })

nock('https://finnhub.io/api/v1/quote')
  .get('?symbol=AAPL&token=API_TOKEN')
  .reply(200, function (_) {
    return `{
      "c": 120,
      "h": 263.31,
      "l": 260.68,
      "o": 261.07,
      "pc": 259.45,
      "t": ${Math.floor(Date.now() / 1000)}  
    }`
  })

nock('https://finnhub.io/api/v1/quote')
  .get('?symbol=FB&token=API_TOKEN')
  .reply(200, function (_) {
    return `{
      "c": 330,
      "h": 263.31,
      "l": 260.68,
      "o": 261.07,
      "pc": 259.45,
      "t": ${Math.floor(Date.now() / 1000)}  
    }`
  })
}

exports.mockTiingoEndpoints = () => {
nock('https://api.tiingo.com/iex')
  .get('/?tickers=TSLA,AAPL,FB&token=API_TOKEN')
  .reply(200, function (_) {
    return `[
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
  })
}

exports.mockIexcloudEndpoints = () => {
nock('https://cloud.iexapis.com/stable/tops')
  .get('?symbols=TSLA,AAPL,FB&token=API_TOKEN')
  .reply(200, function (_) {
    return `[
      {
        "symbol":"TSLA",
        "sector":"consumerdurables",
        "securityType":"cs",
        "bidPrice":0,
        "bidSize":0,
        "askPrice":0,
        "askSize":0,
        "lastUpdated":1623096987115,
        "lastSalePrice":607,
        "lastSaleSize":10,
        "lastSaleTime": ${Date.now()},
        "volume":480662
      },
      {
        "symbol":"AAPL",
        "sector":"electronictechnology",
        "securityType":"cs",
        "bidPrice":0,
        "bidSize":0,
        "askPrice":0,
        "askSize":0,
        "lastUpdated":1623099600004,
        "lastSalePrice":150,
        "lastSaleSize":100,
        "lastSaleTime": ${Date.now()},
        "volume":1401779
      },
      {
        "symbol":"FB",
        "sector":"technologyservices",
        "securityType":"cs",
        "bidPrice":0,
        "bidSize":0,
        "askPrice":0,
        "askSize":0,
        "lastUpdated":1623097044336,
        "lastSalePrice":350,
        "lastSaleSize":15,
        "lastSaleTime": ${Date.now()},
        "volume":598873
      }
    ]`
  })
}