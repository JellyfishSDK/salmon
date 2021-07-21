import { handleGenericPriceApiProvider } from './generic'
import { IexForexPriceProvider } from '@defichain/salmon-provider-iexcloud-forex'

export async function iexForex (event?: any): Promise<any> {
  const apiToken = process.env.API_TOKEN ?? ''
  return await handleGenericPriceApiProvider(new IexForexPriceProvider(apiToken), event)
};
