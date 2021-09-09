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
    readonly config: PriceSourceConfig,
    private readonly priceProvider: PriceProvider
  ) {
  }

  private static isAssetValid (asset: AssetPrice): boolean {
    if (asset.asset === undefined) {
      return false
    }

    if (asset.price === undefined || asset.price.isNaN()) {
      return false
    }

    if (asset.timestamp === undefined || asset.timestamp.isNaN()) {
      return false
    }

    if (asset.price.eq(0) || asset.timestamp.eq(0)) {
      return false
    }

    return true
  }

  /**
   * Filters asset prices according to timestamps
   *
   * @param {AssetPrice[]} assets assets to be filtered
   * @param {number} timespan the timestan at which we filter for
   * @param {Date} [dateNow] default = new Date()
   * @return {AssetPrice[]}
   */
  public static filterTimestamps (assets: AssetPrice[], timespan: number,
    dateNow: Date = new Date()): AssetPrice[] {
    return assets.filter((asset: AssetPrice): boolean => {
      const dateMilliseconds = new BigNumber(dateNow.getTime())
      const dateSubtracted = dateMilliseconds.minus(asset.timestamp)
      const absoluteDate = dateSubtracted.abs()
      return absoluteDate.lte(new BigNumber(timespan))
    })
  }

  /**
   * Fetches prices according to config and provider
   *`
   * @return {AssetPrice[]}
   */
  public async fetchAssetPrices (): Promise<AssetPrice[]> {
    if (this.config.symbols.length === 0) {
      throw new PriceManagerError('Symbol list cannot be empty')
    }

    // Don't throw if there is an issue with one price, instead filter them out
    // This is so one error doesn't cascade and cause issues with other prices
    return (await this.priceProvider.prices(this.config.symbols))
      .filter(PriceManager.isAssetValid)
  }
}
