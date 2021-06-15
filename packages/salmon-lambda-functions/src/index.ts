import { AssetPrice, FinnhubbPriceProvider, IexPriceProvider, PriceManager, PriceSourceConfig, TiingoPriceProvider } from '@defichain/salmon-price-functions'
import BigNumber from 'bignumber.js'

export async function handler (event) {
  const tiingoConfig: PriceSourceConfig = {
    symbols: ['TSLA']
  }

  const priceManager = new PriceManager(tiingoConfig, new TiingoPriceProvider('API_TOKEN'))
  const prices = await priceManager.fetchAssetPrices()

  const response = {
    statusCode: 200,
    body: JSON.stringify(prices)
  }
  return response
};
