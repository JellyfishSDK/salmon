
import nock from 'nock'
import { AssetPrice, FinnhubbPriceProvider, IexPriceProvider, PriceManager, PriceProvider, PriceSourceConfig, TiingoPriceProvider } from '../src'
import BigNumber from 'bignumber.js'

describe('single price fetch', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should fetch price from tiingo using config', async () => {
    nock('https://api.tiingo.com/iex')
      .get('/?tickers=TSLA&token=API_TOKEN')
      .reply(200, function (_) {
        return `[
          {
            "lastSaleTimestamp":"2021-05-28T20:00:00+00:00",
            "askSize":null,
            "high":635.59,
            "open":628.5,
            "low":622.38,
            "bidPrice":null,
            "askPrice":null,
            "timestamp":"2021-05-28T20:00:00+00:00",
            "lastSize":null,
            "last":625.22,
            "quoteTimestamp":"2021-05-28T20:00:00+00:00",
            "ticker":"TSLA",
            "mid":null,
            "bidSize":null,
            "volume":22737038,
            "tngoLast":625.22,
            "prevClose":630.85
          }
        ]`
      })

    const tiingoConfig: PriceSourceConfig = {
      symbols: ['TSLA']
    }

    const priceManager = new PriceManager(tiingoConfig, new TiingoPriceProvider('API_TOKEN'))
    const prices = await priceManager.fetchAssetPrices()
    expect(prices[0].asset).toStrictEqual('TSLA')
    expect(prices[0].price).toStrictEqual(new BigNumber(625.22))
    expect(prices[0].timestamp).toStrictEqual(new BigNumber(1622232000000))
  })

  it('should fetch price from iexcloud using config', async () => {
    nock('https://cloud.iexapis.com/stable/tops')
      .get('?symbols=FB&token=API_TOKEN')
      .reply(200, function (_) {
        return `[
          {
            "symbol": "FB",
            "bidSize": 200,
            "bidPrice": 120.8,
            "askSize": 100,
            "askPrice": 122.5,
            "volume": 205208,
            "lastSalePrice": 121.41,
            "lastSaleSize": 100,
            "lastSaleTime": 1480446908666,
            "lastUpdated": 1480446923942,
            "sector": "softwareservices",
            "securityType": "commonstock"
          }
        ]`
      })

    const iexConfig: PriceSourceConfig = {
      symbols: ['FB']
    }

    const priceManager = new PriceManager(iexConfig, new IexPriceProvider('API_TOKEN'))
    const prices = await priceManager.fetchAssetPrices()
    expect(prices[0].asset).toStrictEqual('FB')
    expect(prices[0].price).toStrictEqual(new BigNumber(121.41))
    expect(prices[0].timestamp).toStrictEqual(new BigNumber(1480446908666))
  })

  it('should fetch price from finnhubb using config', async () => {
    nock('https://finnhub.io/api/v1/quote')
      .get('?symbol=AAPL&token=API_TOKEN')
      .reply(200, function (_) {
        return `{
          "c": 261.74,
          "h": 263.31,
          "l": 260.68,
          "o": 261.07,
          "pc": 259.45,
          "t": 1582641000 
        }`
      })

    const finnhubbConfig: PriceSourceConfig = {
      symbols: ['AAPL']
    }

    const priceManager = new PriceManager(finnhubbConfig, new FinnhubbPriceProvider('API_TOKEN'))
    const prices = await priceManager.fetchAssetPrices()
    expect(prices[0].asset).toStrictEqual('AAPL')
    expect(prices[0].price).toStrictEqual(new BigNumber(261.74))
    expect(prices[0].timestamp).toStrictEqual(new BigNumber(1582641000000))
  })

  it('should exclude invalid data', async () => {
    class MockPriceProvider implements PriceProvider {
      constructor (
        private readonly assetData: string
      ) {
      }

      public async prices (symbols: string[]): Promise<AssetPrice[]> {
        return symbols.map(() => {
          const badAsset = JSON.parse(this.assetData)
          return {
            asset: badAsset.asset,
            price: new BigNumber(badAsset.price),
            timestamp: badAsset.timestamp
          }
        })
      }
    }

    const badProviderConfig: PriceSourceConfig = {
      symbols: ['AAPL']
    }

    const priceManagerNoAsset = new PriceManager(badProviderConfig,
      new MockPriceProvider('{}'))
    const pricesNoAsset = await priceManagerNoAsset.fetchAssetPrices()
    expect(pricesNoAsset.length).toStrictEqual(0)

    const priceManagerNoPrice = new PriceManager(badProviderConfig,
      new MockPriceProvider('{"asset":"AAPL"}'))
    const pricesNoPrice = await priceManagerNoPrice.fetchAssetPrices()
    expect(pricesNoPrice.length).toStrictEqual(0)

    const priceManagerNoTimestamp = new PriceManager(badProviderConfig,
      new MockPriceProvider('{"asset":"AAPL", "price": 100.0}'))
    const pricesNoTimestamp = await priceManagerNoTimestamp.fetchAssetPrices()
    expect(pricesNoTimestamp.length).toStrictEqual(0)
  })

  it('complain if symbol list is empty', async () => {
    const badConfig: PriceSourceConfig = {
      symbols: []
    }

    await expect(async () => {
      const priceManager = new PriceManager(badConfig, new FinnhubbPriceProvider('API_TOKEN'))
      await priceManager.fetchAssetPrices()
    }).rejects.toThrow('Symbol list cannot be empty')
  })

  it('should throw when receiving malformed data', async () => {
    nock('https://finnhub.io/api/v1/quote')
      .get('?symbol=AAPL&token=API_TOKEN')
      .reply(500, function (_) {
        return 'Error'
      })

    const finnhubbConfig: PriceSourceConfig = {
      symbols: ['AAPL']
    }

    const priceManager = new PriceManager(finnhubbConfig, new FinnhubbPriceProvider('API_TOKEN'))
    await expect(async () => {
      await priceManager.fetchAssetPrices()
    }).rejects.toThrow(SyntaxError)
  })
})
