import { handleGenericPriceApiProvider } from './generic'
import { TiingoForexPriceProvider } from '@defichain/salmon-provider-tiingo-forex'

export async function handler (event?: any): Promise<any> {
  const apiToken = process.env.API_TOKEN ?? ''
  return await handleGenericPriceApiProvider(new TiingoForexPriceProvider(apiToken), event)
};
