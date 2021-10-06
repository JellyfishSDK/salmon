import { handleGenericPriceApiProvider } from './generic'
import { AlphaVantageForexPriceProvider } from '@defichain/salmon-provider-alpha-vantage-forex'

export async function alphaVantageForex (event?: any): Promise<any> {
  const apiToken = process.env.API_TOKEN ?? ''
  return await handleGenericPriceApiProvider(new AlphaVantageForexPriceProvider(apiToken), event)
};
