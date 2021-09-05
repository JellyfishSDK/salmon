import { PriceManager, PriceProvider, AssetPrice } from '@defichain/salmon-price-functions'
import { WhaleOraclesManager } from '@defichain/salmon-oracles-functions'
import { getEnvironmentConfig, EnvironmentConfig } from './environment'
import { checkBalanceAndNotify } from './slack'

// Maximum price age in minutes
const MAX_PRICE_AGE = 30

export async function broadcastPrices (oraclesManager: WhaleOraclesManager, env: EnvironmentConfig, prices: AssetPrice[]): Promise<string | undefined> {
  const tokenPrices = prices.map(assetPrice => ({
    token: assetPrice.asset, prices: [{ currency: env.currency, amount: assetPrice.price }]
  }))

  const filteredTokenPrices = await oraclesManager.filterAgainstExistingPrices(tokenPrices, env.oracleId)
  return await oraclesManager.updatePrices(env.oracleId, filteredTokenPrices)
}

export async function fetchPrices (env: EnvironmentConfig, provider: PriceProvider): Promise<AssetPrice[]> {
  const priceManager = new PriceManager({ symbols: env.symbols }, provider)
  return PriceManager.filterTimestamps(await priceManager.fetchAssetPrices(),
    MAX_PRICE_AGE * 60 * 1000)
}

export async function handleGenericPriceApiProvider (provider: PriceProvider, event?: any): Promise<any> {
  const env = await getEnvironmentConfig()

  const prices = await fetchPrices(env, provider)
  console.log(JSON.stringify({ prices, event }))

  const oraclesManager = WhaleOraclesManager.withWhaleClient(env.oceanUrl, env.network, env.privateKey)

  try {
    const txid = await broadcastPrices(oraclesManager, env, prices)
    if (txid !== undefined) {
      console.log(`Sent with txid: ${txid}`)
    }
  } catch (e) {
    if (e.message.indexOf('txn-mempool-conflict') !== -1) {
      console.log('txn-mempool-conflict (code 18)')
    } else {
      throw e
    }
  } finally {
    // This gets called even if we escalate the exception, as
    // it may be caused by low balance
    if (env.slackWebhookUrl !== '') {
      await checkBalanceAndNotify(oraclesManager.walletAccount, oraclesManager.whaleClient, env)
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ prices, event })
  }
}
