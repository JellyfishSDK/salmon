import { handleGenericPriceApiProvider } from './generic'
import { TiingoPriceProvider } from '@defichain/salmon-provider-tiingo'

export async function tiingo (event?: any): Promise<any> {
  const apiToken = process.env.API_TOKEN ?? ''
  return await handleGenericPriceApiProvider(new TiingoPriceProvider(apiToken), event)
};
