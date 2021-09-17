import { PriceManager, PriceProvider, AssetPrice } from '@defichain/salmon-price-functions'
import { WhaleOraclesManager } from '@defichain/salmon-oracles-functions'
import { getEnvironmentConfig, EnvironmentConfig } from './environment'
import { checkBalanceAndNotify, sendSlackMessage } from './slack'
import { TokenPrice } from '@defichain/jellyfish-transaction'

// Maximum price age in milliseconds
const MAX_PRICE_AGE = 180 * 60 * 1000

export async function filterPrices (oraclesManager: WhaleOraclesManager, env: EnvironmentConfig, prices: AssetPrice[]): Promise<TokenPrice[]> {
  const tokenPrices = prices.map(assetPrice => ({
    token: assetPrice.asset, prices: [{ currency: env.currency, amount: assetPrice.price }]
  }))

  const existingPrices = await oraclesManager.listExistingOraclePrices(tokenPrices, env.oracleId)
  const filteredTokenPrices = await oraclesManager.filterAgainstExistingPrices(tokenPrices, existingPrices,
    async (tokenPrice, existing) => {
      const errMsg = `Price had sudden movement, not submitting. ${tokenPrice.token} jumped from ${existing.amount} to ${tokenPrice.prices[0].amount.toFixed(8)}`
      await sendSlackMessage(errMsg, ':exclamation:', env)
    }, env.closeThreshold, env.farThreshold)
  return filteredTokenPrices
}

export async function fetchPrices (env: EnvironmentConfig, provider: PriceProvider): Promise<AssetPrice[]> {
  const priceManager = new PriceManager({ symbols: env.symbols }, provider)
  return PriceManager.filterTimestamps(await priceManager.fetchAssetPrices(), MAX_PRICE_AGE)
}

export async function handleGenericPriceApiProvider (provider: PriceProvider, event?: any): Promise<any> {
  const env = await getEnvironmentConfig()

  const prices = await fetchPrices(env, provider)
  console.log(JSON.stringify({ event }))

  const oraclesManager = WhaleOraclesManager.withWhaleClient(env.oceanUrl, env.network, env.privateKey)
  const filteredPrices = await filterPrices(oraclesManager, env, prices)

  try {
    const txid = await oraclesManager.updatePrices(env.oracleId, filteredPrices)
    if (txid !== undefined) {
      console.log(`Sent with txid: ${txid}`)
    }
  } catch (e) {
    if ((e as Error).message.includes('txn-mempool-conflict')) {
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
    body: JSON.stringify({ prices: filteredPrices, event })
  }
}
