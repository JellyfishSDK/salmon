import { handleGenericPriceApiProvider } from './generic'
import { CoingeckoPriceProvider } from '@defichain/salmon-provider-coingecko'

export async function coingecko (event?: any): Promise<any> {
  return await handleGenericPriceApiProvider(new CoingeckoPriceProvider(), event)
};
