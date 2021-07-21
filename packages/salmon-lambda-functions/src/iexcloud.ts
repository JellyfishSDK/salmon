import { handleGenericPriceApiProvider } from './generic'
import { IexPriceProvider } from '@defichain/salmon-provider-iexcloud'

export async function iex (event?: any): Promise<any> {
  const apiToken = process.env.API_TOKEN ?? ''
  return await handleGenericPriceApiProvider(new IexPriceProvider(apiToken), event)
};
