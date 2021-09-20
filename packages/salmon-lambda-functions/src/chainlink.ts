import { handleGenericPriceApiProvider } from './generic'
import { ChainlinkPriceProvider } from '@defichain/salmon-provider-chainlink'

export async function chainlink (event?: any): Promise<any> {
  const apiToken = process.env.API_TOKEN ?? ''
  return await handleGenericPriceApiProvider(new ChainlinkPriceProvider(apiToken), event)
};
