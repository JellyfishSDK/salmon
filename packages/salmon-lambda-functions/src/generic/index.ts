import { PriceManager, PriceProvider, AssetPrice } from '@defichain/salmon-price-functions'
import { OraclesManager } from '@defichain/salmon-oracles-functions'

interface EnvironmentConfig {
  oceanUrl: string
  network: string
  oracleId: string
  currency: string
  symbols: string[]
  intervalSeconds: number
  privateKey: string
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  return {
    oceanUrl: process.env.OCEAN_URL ?? 'localhost',
    network: process.env.NETWORK ?? 'regtest',
    oracleId: process.env.ORACLE_ID ?? '',
    currency: process.env.CURRENCY ?? 'USD',
    symbols: (process.env.SYMBOLS ?? '').split(','),
    intervalSeconds: parseInt(process.env.INTERVAL_SECONDS ?? '300'),
    privateKey: process.env.PRIVATE_KEY ?? '' //! TODO: Fetch some other way perhaps
  }
}

const broadcastPrices = async (env: EnvironmentConfig, prices: AssetPrice[]): Promise<void> => {
  const oraclesManager = OraclesManager.withWhaleClient(env.oceanUrl, env.network, env.privateKey)
  await oraclesManager.updatePrices(env.oracleId,
    prices.map(assetPrice => ({
      token: assetPrice.asset, prices: [{ currency: env.currency, amount: assetPrice.price }]
    })))
}

const fetchPrices = async (env: EnvironmentConfig, provider: PriceProvider): Promise<AssetPrice[]> => {
  const priceManager = new PriceManager({ symbols: env.symbols }, provider)
  return PriceManager.filterTimestamps(await priceManager.fetchAssetPrices(),
    new Date(env.intervalSeconds * 1000.0))
}

export async function handleGenericPriceApiProvider (provider: PriceProvider, event?: any): Promise<any> {
  const env = getEnvironmentConfig()
  const prices = await fetchPrices(env, provider)
  await broadcastPrices(env, prices)

  console.log(JSON.stringify({ prices, event }))

  return {
    statusCode: 200,
    body: JSON.stringify({ prices, event })
  }
}
