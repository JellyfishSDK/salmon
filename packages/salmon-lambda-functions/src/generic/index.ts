import { PriceManager, PriceProvider, AssetPrice } from '@defichain/salmon-price-functions'
import { OraclesManager } from '@defichain/salmon-oracles-functions'
import { getEnvironmentConfig, EnvironmentConfig } from './environment'
import { checkBalanceAndNotify } from './slack'

const broadcastPrices = async (oraclesManager: OraclesManager, env: EnvironmentConfig, prices: AssetPrice[]): Promise<string | undefined> => {
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

  const oraclesManager = OraclesManager.withWhaleClient(env.oceanUrl, env.network, env.privateKey)

  try {
    const txid = await broadcastPrices(oraclesManager, env, prices)
    if (txid !== undefined) {
      console.log(`Sent with txid: ${txid}`)
    }
  } finally {
    // This gets called even if we escalate the exception, as
    // it may be caused by low balance
    if (env.slackWebhookUrl !== '') {
      await checkBalanceAndNotify(oraclesManager.walletAccount, env)
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ prices, event })
  }
}
