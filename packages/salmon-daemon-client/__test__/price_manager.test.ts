
import nock from 'nock'
import { PriceManager } from '../src'

const tiingoResponse = [{ lastSaleTimestamp: '2021-05-28T20:00:00+00:00', askSize: null, high: 635.59, open: 628.5, low: 622.38, bidPrice: null, askPrice: null, timestamp: '2021-05-28T20:00:00+00:00', lastSize: null, last: 625.22, quoteTimestamp: '2021-05-28T20:00:00+00:00', ticker: 'TSLA', mid: null, bidSize: null, volume: 22737038, tngoLast: 625.22, prevClose: 630.85 }]

describe('JSON-RPC 1.0 specification', () => {
  const intercept = jest.fn()

  beforeEach(() => {
    nock('https://api.tiingo.com/iex/tsla')
      .get('/')
      .reply(200, function (_, body: string) {
        const req = JSON.parse(body)
        intercept(req)
        return tiingoResponse
      })
      .persist()
  })

  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should fatch price', async () => {
    const priceManager = new PriceManager()
    const price = await priceManager.fetchValueFromSource('https://api.tiingo.com/iex/tsla', 'last')
    console.log(price)
  })
})
