import { handleGenericPriceApiProvider } from './generic'
import { NasdaqPriceProvider } from '@defichain/salmon-provider-nasdaq'

export async function nasdaq (event?: any): Promise<any> {
  const apiToken = process.env.API_TOKEN ?? ''
  return await handleGenericPriceApiProvider(new NasdaqPriceProvider(apiToken), event)
};
