import BigNumber from 'bignumber.js'
import { AssetPrice, PriceProvider } from '@defichain/salmon-price-functions'
import { poolpairs, WhaleApiClient } from '@defichain/whale-api-client'
import { DEFICHAIN_DEX_SYMBOL_MAPPING } from './mapping'

type PoolPairData = poolpairs.PoolPairData

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
  private async fetchAsset (asset: string, pairs: PoolPairData[]): Promise<AssetPrice | undefined> {
    const symbolMapping = DEFICHAIN_DEX_SYMBOL_MAPPING[asset]
    const data = pairs.find((y: PoolPairData) => y.symbol === symbolMapping.ticker)
    if (data === undefined) {
      return undefined
    }

    const tokenA = new BigNumber(symbolMapping.inverse ? data.tokenB.reserve : data.tokenA.reserve)
    const tokenB = new BigNumber(symbolMapping.inverse ? data.tokenA.reserve : data.tokenB.reserve)
    const price = tokenA.div(tokenB).multipliedBy(await symbolMapping.priceAdjustmentCallback())

    return {
      asset,
      price,
      timestamp: new BigNumber(Date.now())
    }
  }

  public async prices (symbols: string[]): Promise<AssetPrice[]> {
    const pairs = await this.getAllPairs()
    const unfilteredData = (await Promise.all(symbols.map(async symbol => {
      return await this.fetchAsset(symbol, pairs)
    })))
    const assets: AssetPrice[] = unfilteredData.filter(x => (x !== undefined)) as AssetPrice[]
    return assets
  }

  private async getAllPairs (): Promise<PoolPairData[]> {
    const env: EnvironmentConfig = await getEnvironmentConfig()
    const client = new WhaleApiClient({
      url: env.oceanUrl,
      network: env.network
    })

    const pairs: poolpairs.PoolPairData[] = []

    let response = await client.poolpairs.list()
    pairs.push(...response)

    while (response.hasNext) {
      response = await client.paginate(response)
      pairs.push(...response)
    }

    return pairs
  }
}
