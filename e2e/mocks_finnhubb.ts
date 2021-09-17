import nock from 'nock'

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

const finnhubbResponse4 = `{
  "c": 350,
  "h": 263.31,
  "l": 260.68,
  "o": 261.07,
  "pc": 259.45,
  "t": ${Math.floor(Date.now() / 1000)}  
}`

export const mockFinnhubbEndpoints = (): void => {
  nock('https://finnhub.io/api/v1/quote')
    .get('?symbol=TSLA&token=API_TOKEN')
    .reply(200, function (_) {
      return finnhubbResponse1
    }).persist()

  nock('https://finnhub.io/api/v1/quote')
    .get('?symbol=AAPL&token=API_TOKEN')
    .reply(200, function (_) {
      return finnhubbResponse2
    }).persist()

  nock('https://finnhub.io/api/v1/quote')
    .get('?symbol=FB&token=API_TOKEN')
    .reply(200, function (_) {
      return finnhubbResponse3
    })

  nock('https://finnhub.io/api/v1/quote')
    .get('?symbol=FB&token=API_TOKEN')
    .reply(200, function (_) {
      return finnhubbResponse4
    })
}
