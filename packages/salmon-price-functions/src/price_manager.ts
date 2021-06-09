import { PriceProvider, AssetPrice } from './price_provider'

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
    return await this.priceProvider.prices(this.config.symbols)
  }
}
