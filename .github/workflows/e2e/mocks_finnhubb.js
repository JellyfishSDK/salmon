const nock = require('nock')

const finnhubbResponse1 = `{
  "c": 605,
  "h": 263.31,
  "l": 260.68,
  "o": 261.07,
  "pc": 259.45,
  "t": ${Math.floor(Date.now() / 1000)} 
}`

const finnhubbResponse2 = `{
  "c": 120,
  "h": 263.31,
  "l": 260.68,
  "o": 261.07,
  "pc": 259.45,
  "t": ${Math.floor(Date.now() / 1000)}  
}`

const finnhubbResponse3 = `{
  "c": 330,
  "h": 263.31,
  "l": 260.68,
  "o": 261.07,
  "pc": 259.45,
  "t": ${Math.floor(Date.now() / 1000)}  
}`

exports.mockFinnhubbEndpoints = () => {
  nock('https://finnhub.io/api/v1/quote')
    .get('?symbol=TSLA&token=API_TOKEN')
    .reply(200, function (_) {
      return finnhubbResponse1
    })

  nock('https://finnhub.io/api/v1/quote')
    .get('?symbol=AAPL&token=API_TOKEN')
    .reply(200, function (_) {
      return finnhubbResponse2
    })

  nock('https://finnhub.io/api/v1/quote')
    .get('?symbol=FB&token=API_TOKEN')
    .reply(200, function (_) {
      return finnhubbResponse3
    })
}
