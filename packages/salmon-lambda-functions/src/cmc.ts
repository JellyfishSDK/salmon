import { handleGenericPriceApiProvider } from './generic'
import { CoinMarketCapPriceProvider } from '@defichain/salmon-provider-coinmarketcap'

export async function cmc (event?: any): Promise<any> {
  const apiToken = process.env.API_TOKEN ?? ''
  return await handleGenericPriceApiProvider(new CoinMarketCapPriceProvider(apiToken), event)
};
