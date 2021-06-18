import { PriceManager, PriceSourceConfig } from '@defichain/salmon-price-functions'
import { TiingoPriceProvider } from '@defichain/salmon-provider-tiingo'

export async function handler (event?: any): Promise<any> {
  const tiingoConfig: PriceSourceConfig = {
    symbols: (process.env.SYMBOLS ?? '').split(',')
  }

  const priceManager = new PriceManager(tiingoConfig, new TiingoPriceProvider(process.env.API_TOKEN ?? ''))
  const prices = await priceManager.fetchAssetPrices()

  console.log(JSON.stringify({ prices, event }))

  return {
    statusCode: 200,
    body: JSON.stringify({ prices, event })
  }
};
