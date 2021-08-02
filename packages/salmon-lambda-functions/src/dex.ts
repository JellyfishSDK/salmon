import { handleGenericPriceApiProvider } from './generic'
import { DexPriceProvider } from '@defichain/salmon-provider-dex'

export async function dex (event?: any): Promise<any> {
  return await handleGenericPriceApiProvider(new DexPriceProvider(), event)
};
