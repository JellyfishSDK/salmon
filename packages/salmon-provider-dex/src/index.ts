import BigNumber from 'bignumber.js'
import { PriceProvider, AssetPrice } from '@defichain/salmon-price-functions'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { DEFICHAIN_DEX_SYMBOL_MAPPING } from './mapping'

export interface EnvironmentConfig {
  oceanUrl: string
  network: string
}

export const getEnvironmentConfig = async (): Promise<EnvironmentConfig> => {
  return {
    oceanUrl: process.env.OCEAN_URL ?? 'https://localhost',
    network: process.env.NETWORK ?? 'regtest'
  }
}

/**
 * Fetches prices from Defichain DEX
 */
export class DexPriceProvider implements PriceProvider {
  private async fetchAsset (asset: string, json: any): Promise<AssetPrice> {
    const symbolMapping = DEFICHAIN_DEX_SYMBOL_MAPPING[asset]
    const data = json.find((y: any) =>
      y.symbol === symbolMapping.ticker)

    const tokenA = new BigNumber(symbolMapping.inverse
      ? data.tokenB.reserve : data.tokenA.reserve)
    const tokenB = new BigNumber(symbolMapping.inverse
      ? data.tokenA.reserve : data.tokenB.reserve)
    const price = tokenA.div(tokenB)
      .multipliedBy(await symbolMapping.priceAdjustmentCallback())

    return {
      asset,
      price,
      timestamp: new BigNumber(Date.now())
    }
  }

  public async prices (symbols: string[]): Promise<AssetPrice[]> {
    const env: EnvironmentConfig = await getEnvironmentConfig()
    const whaleClient = new WhaleApiClient({
      url: env.oceanUrl,
      network: env.network
    })

    const json = await whaleClient.poolpair.list(1000)
    return await Promise.all(symbols.map(async symbol => {
      return await this.fetchAsset(symbol, json)
    }))
  }
}
