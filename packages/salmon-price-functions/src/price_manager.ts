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
  }

  /**
   * Fetches prices according to config and provider
   *
   * @return {AssetPrice[]}
   */
  async fetchAssetPrices (): Promise<AssetPrice[]> {
    if (this.config.symbols.length === 0) {
      throw new PriceManagerError('Symbol list cannot be empty')
    }

    return await this.priceProvider.prices(this.config.symbols)
  }
}
