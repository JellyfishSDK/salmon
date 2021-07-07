import { PriceManager, PriceProvider, AssetPrice } from '@defichain/salmon-price-functions'
import { OraclesManager } from '@defichain/salmon-oracles-functions'
import aws from 'aws-sdk'

interface EnvironmentConfig {
  oceanUrl: string
  network: string
  oracleId: string
  currency: string
  symbols: string[]
  intervalSeconds: number
  privateKey: string
}

const getEnvironmentConfig = async (): Promise<EnvironmentConfig> => {
  let privateKey = process.env.PRIVATE_KEY ?? ''

  if (process.env.PRIVATE_KEY_SSM_KEY !== undefined) {
    const paramConfig = {
      Name: process.env.PRIVATE_KEY_SSM_KEY,
      WithDecryption: true
    }

    const parameterStore = new aws.SSM()
    const param = await parameterStore.getParameter(paramConfig).promise()
    privateKey = param.Parameter?.Value ?? ''
  }

  return {
    oceanUrl: process.env.OCEAN_URL ?? 'localhost',
    network: process.env.NETWORK ?? 'regtest',
    oracleId: process.env.ORACLE_ID ?? '',
    currency: process.env.CURRENCY ?? 'USD',
    symbols: (process.env.SYMBOLS ?? '').split(','),
    intervalSeconds: parseInt(process.env.INTERVAL_SECONDS ?? '300'),
    privateKey
  }
}

const broadcastPrices = async (env: EnvironmentConfig, prices: AssetPrice[]): Promise<string | undefined> => {
  const oraclesManager = OraclesManager.withWhaleClient(env.oceanUrl, env.network, env.privateKey)
  return await oraclesManager.updatePrices(env.oracleId,
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
  const env = await getEnvironmentConfig()
  const prices = await fetchPrices(env, provider)
  console.log(JSON.stringify({ prices, event }))

  const txid = await broadcastPrices(env, prices)
  if (txid !== undefined) {
    console.log(`Sent with txid: ${txid}`)
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ prices, event })
  }
}
