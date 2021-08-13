import { PriceManager, PriceProvider, AssetPrice } from '@defichain/salmon-price-functions'
import { OraclesManager } from '@defichain/salmon-oracles-functions'
import { getEnvironmentConfig, EnvironmentConfig } from './environment'
import { checkBalanceAndNotify } from './slack'
import { WhaleApiClient } from '@defichain/whale-api-client'
import BigNumber from 'bignumber.js'

// Maximum price age in minutes
const MAX_PRICE_AGE = 30

async function broadcastPrices (oraclesManager: OraclesManager, env: EnvironmentConfig, prices: AssetPrice[]): Promise<string | undefined> {
  return await oraclesManager.updatePrices(env.oracleId,
    prices.map(assetPrice => ({
      token: assetPrice.asset, prices: [{ currency: env.currency, amount: assetPrice.price }]
    })))
}

async function fetchPrices (env: EnvironmentConfig, provider: PriceProvider,
  whaleClient: WhaleApiClient): Promise<AssetPrice[]> {
  const priceManager = new PriceManager({ symbols: env.symbols }, provider)
  const assetPrices = PriceManager.filterTimestamps(await priceManager.fetchAssetPrices(),
    MAX_PRICE_AGE * 60 * 1000)

  const assetPricesFiltered = await Promise.all<AssetPrice>(assetPrices.filter(async asset => {
    const existing = await whaleClient.oracles.getPriceFeed(env.oracleId, asset.asset, env.currency, 1)

    if (existing.length === 0) {
      return true
    }

    return !(new BigNumber(existing[0].amount).eq(asset.price))
  }))

  return assetPricesFiltered
}

export async function handleGenericPriceApiProvider (provider: PriceProvider, event?: any): Promise<any> {
  const env = await getEnvironmentConfig()

  const whaleClient = new WhaleApiClient({
    url: env.oceanUrl,
    network: env.network
  })

  const prices = await fetchPrices(env, provider, whaleClient)
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
      await checkBalanceAndNotify(oraclesManager.walletAccount, whaleClient, env)
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ prices, event })
  }
}
