import { BigNumber } from 'bignumber.js'
import { PriceProvider, AssetPrice } from './price_provider'

/**
 * Error while working with PriceManager.
 */
export class PriceManagerError extends Error {}

/**
 * Config for a price source, takes a list of symbols to fetch
 */
export interface PriceSourceConfig {
  symbols: string[]
}

/**
 * Price manager handles fetching of prices from price providers
 */
export class PriceManager {
  constructor (
    private readonly config: PriceSourceConfig,
    private readonly priceProvider: PriceProvider
  ) {
    if (config.symbols.length === 0) {
      throw new PriceManagerError('Symbol list cannot be empty')
    }
  }

  /**
   * Filters asset prices according to timestamps
   *
   * @param {AssetPrice[]} assets assets to be filtered
   * @param {Date} timespan the timestan at which we filter for
   * @param {Date} [compareDate] default = new Date()
   * @return {AssetPrice[]}
   */
  public static filterTimestamps (assets: AssetPrice[], timespan: Date,
    compareDate: Date = new Date()): AssetPrice[] {
    const timeDiffCheck = (timestamp: BigNumber): boolean => {
      const timeDiff = (new BigNumber(compareDate.getTime()).minus(timestamp)).abs()
      return timeDiff.lte(new BigNumber(timespan.getTime()))
    }

    return assets.filter(asset => timeDiffCheck(asset.timestamp))
  }

  /**
   * Fetches prices according to config and provider
   *`
   * @return {AssetPrice[]}
   */
  public async fetchAssetPrices (): Promise<AssetPrice[]> {
    const filterAssets = (asset: AssetPrice): boolean => {
      return asset.asset !== undefined &&
              !asset.price.isNaN() &&
              asset.timestamp !== undefined &&
              !asset.timestamp.isNaN()
    }

    // Don't throw if there is an issue with one price, instead filter them out
    // This is so one error doesn't cascade and cause issues with other prices
    return (await this.priceProvider.prices(this.config.symbols)).filter(filterAssets)
  }
}
