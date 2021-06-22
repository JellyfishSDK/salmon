import { PriceManager, PriceSourceConfig } from '@defichain/salmon-price-functions'
import { TiingoPriceProvider } from '@defichain/salmon-provider-tiingo'
import { OraclesManager } from '@defichain/salmon-oracles-functions'

export async function handler (event?: any): Promise<any> {
  // Fetch env vars at the top here so it's clearer
  const apiToken = process.env.API_TOKEN ?? ''
  const oceanUrl = process.env.OCEAN_URL ?? 'localhost'
  const network = process.env.NETWORK ?? 'regtest'
  const oracleId = process.env.ORACLE_ID ?? ''
  const currency = process.env.CURRENCY ?? 'USD'
  const symbols = process.env.SYMBOLS ?? ''
  //! TODO: Fetch some other way perhaps
  const privateKey = process.env.PRIVATE_KEY ?? ''

  const config: PriceSourceConfig = {
    symbols: symbols.split(',')
  }

  const priceManager = new PriceManager(config, new TiingoPriceProvider(apiToken))
  const prices = await priceManager.fetchAssetPrices()

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
