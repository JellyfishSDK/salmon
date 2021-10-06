import { handleGenericPriceApiProvider } from './generic'
import { AlphaVantagePriceProvider } from '@defichain/salmon-provider-alpha-vantage'

export async function alphaVantage (event?: any): Promise<any> {
  const apiToken = process.env.API_TOKEN ?? ''
  return await handleGenericPriceApiProvider(new AlphaVantagePriceProvider(apiToken), event)
};
