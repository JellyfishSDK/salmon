import { BigNumber } from '@defichain/jellyfish-json'

/**
 * Structure holding asset price
 */
export interface AssetPrice {
  asset: string
  price: BigNumber
  timestamp: BigNumber
}

/**
 * Source ignostic price provider, must return a price when called upon if able
 */
export interface PriceProvider {
  /**
   * Returns prices for given symbols
   *
   * @param {string[]} symbols
   * @return {Promise<AssetPrice[]>} symbol prices
   */
  prices: (symbols: string[]) => Promise<AssetPrice[]>
}
