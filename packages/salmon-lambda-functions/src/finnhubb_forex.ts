import { handleGenericPriceApiProvider } from './generic'
import { FinnhubbForexPriceProvider } from '@defichain/salmon-provider-finnhubb-forex'

export async function handler (event?: any): Promise<any> {
  const apiToken = process.env.API_TOKEN ?? ''
  return await handleGenericPriceApiProvider(new FinnhubbForexPriceProvider(apiToken), event)
};
