import { PriceManager, PriceSourceConfig, PriceProvider } from '@defichain/salmon-price-functions'
import { OraclesManager } from '@defichain/salmon-oracles-functions'

export async function handleGenericPriceApiProvider (provider: PriceProvider, event?: any): Promise<any> {
  // Fetch env vars at the top here so it's clearer
  const oceanUrl = process.env.OCEAN_URL ?? 'localhost'
  const network = process.env.NETWORK ?? 'regtest'
  const oracleId = process.env.ORACLE_ID ?? ''
  const currency = process.env.CURRENCY ?? 'USD'
  const symbols = process.env.SYMBOLS ?? ''
  const intervalSeconds = parseInt(process.env.INTERVAL_SECONDS ?? '300')
  //! TODO: Fetch some other way perhaps
  const privateKey = process.env.PRIVATE_KEY ?? ''

  const config: PriceSourceConfig = {
    symbols: symbols.split(',')
  }

  const priceManager = new PriceManager(config, provider)
  const prices = PriceManager.filterTimestamps(await priceManager.fetchAssetPrices(),
    new Date(intervalSeconds * 1000.0))

  const oraclesManager = OraclesManager.withWhaleClient(oceanUrl, network, privateKey)
  await oraclesManager.updatePrices(oracleId,
    prices.map(assetPrice => ({
      token: assetPrice.asset,
      prices: [{ currency, amount: assetPrice.price }]
    })))

  console.log(JSON.stringify({ prices, event }))

  return {
    statusCode: 200,
    body: JSON.stringify({ prices, event })
  }
};
