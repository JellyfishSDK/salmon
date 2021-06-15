import { PriceManager, PriceSourceConfig, TiingoPriceProvider } from '@defichain/salmon-price-functions'

export async function handler (event: any): Promise<any> {
  const tiingoConfig: PriceSourceConfig = {
    symbols: ['TSLA']
  }

  const priceManager = new PriceManager(tiingoConfig, new TiingoPriceProvider('API_TOKEN'))
  const prices = await priceManager.fetchAssetPrices()

  return {
    statusCode: 200,
    body: JSON.stringify({ prices, event })
  }
};
