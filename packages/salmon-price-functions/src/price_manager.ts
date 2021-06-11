import { BigNumber } from '@defichain/jellyfish-json'
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
  pollingPeriod: Date
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
   * Fetches prices according to config and provider
   *
   * @return {AssetPrice[]}
   */
  async fetchAssetPrices (): Promise<AssetPrice[]> {
    const timeDiffCheck = (timestamp: BigNumber): boolean => {
      const timeDiff = (new BigNumber(Date.now()).minus(timestamp)).abs()
      return timeDiff < new BigNumber((this.config.pollingPeriod).getTime())
    }

    // Don't throw if there is an issue with one price, instead filter them out
    // This is so one error doesn't cascade and cause issues with other prices
    return (await this.priceProvider.prices(this.config.symbols)).filter(
      asset => asset.asset !== undefined && !asset.price.isNaN() &&
          !asset.timestamp.isNaN() && timeDiffCheck(asset.timestamp)
    )
  }
}
