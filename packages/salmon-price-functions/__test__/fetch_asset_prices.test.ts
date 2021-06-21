
import nock from 'nock'
import { AssetPrice, PriceManager, PriceProvider, PriceSourceConfig } from '../src'
import BigNumber from 'bignumber.js'

describe('single price fetch', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
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
    class MockPriceProvider implements PriceProvider {
      public async prices (symbols: string[]): Promise<AssetPrice[]> {
        return []
      }
    }

    const badConfig: PriceSourceConfig = {
      symbols: []
    }

    await expect(async () => {
      const priceManager = new PriceManager(badConfig, new MockPriceProvider())
      await priceManager.fetchAssetPrices()
    }).rejects.toThrow('Symbol list cannot be empty')
  })
})
