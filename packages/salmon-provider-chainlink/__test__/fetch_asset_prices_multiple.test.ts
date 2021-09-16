
import nock from 'nock'
import { PriceManager, PriceSourceConfig } from '@defichain/salmon-price-functions'
import { ChainlinkPriceProvider } from '../src'
import BigNumber from 'bignumber.js'

describe('single price fetch', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should fetch price from chainlink using config', async () => {
    nock('https://mainnet.infura.io/v3')
      .post('/API_TOKEN')
      .reply(200, (_) => {
        return '{"jsonrpc":"2.0","id":42,"result":"0x0000000000000000000000000000000000000000000000000000042f6e63a936"}'
      })

    nock('https://mainnet.infura.io/v3')
      .post('/API_TOKEN')
      .reply(200, (_) => {
        return '{"jsonrpc":"2.0","id":43,"result":"0x0000000000000000000000000000000000000000000000000000000000000008"}'
      })

    nock('https://mainnet.infura.io/v3')
      .post('/API_TOKEN')
      .reply(200, (_) => {
        return '{"jsonrpc":"2.0","id":44,"result":"0x0000000000000000000000000000000000000000000000000000000061406448"}'
      })

    const config: PriceSourceConfig = {
      symbols: ['BTC']
    }

    const priceManager = new PriceManager(config, new ChainlinkPriceProvider('API_TOKEN'))
    const prices = await priceManager.fetchAssetPrices()
    expect(prices[0].asset).toStrictEqual('BTC')
    expect(prices[0].price).toStrictEqual(new BigNumber(46017.61999158))
    expect(prices[0].timestamp).toStrictEqual(new BigNumber(1631609928000))
  })
})

describe('throw on invalid data', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should throw on corrupt data', async () => {
    nock('https://mainnet.infura.io/v3')
      .post('/API_TOKEN')
      .reply(200, (_) => {
        return '{}'
      })

    nock('https://mainnet.infura.io/v3')
      .post('/API_TOKEN')
      .reply(200, (_) => {
        return '{}'
      })

    nock('https://mainnet.infura.io/v3')
      .post('/API_TOKEN')
      .reply(200, (_) => {
        return '{}'
      })

    const config: PriceSourceConfig = {
      symbols: ['BTC']
    }

    const priceManager = new PriceManager(config, new ChainlinkPriceProvider('API_TOKEN'))
    await expect(priceManager.fetchAssetPrices()).rejects.toThrow()
  })
})
