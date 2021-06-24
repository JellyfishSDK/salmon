import { handleGenericPriceApiProvider } from './generic'
import { FinnhubbPriceProvider } from '@defichain/salmon-provider-finnhubb'

export async function handler (event?: any): Promise<any> {
  const apiToken = process.env.API_TOKEN ?? ''
  return await handleGenericPriceApiProvider(new FinnhubbPriceProvider(apiToken), event)
};
