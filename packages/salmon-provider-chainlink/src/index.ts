import { PriceProvider, AssetPrice } from '@defichain/salmon-price-functions'
import BigNumber from 'bignumber.js'
import { CHAINLINK_SYMBOL_MAPPING } from './mapping'
import { ethers } from 'ethers'
import { CHAINLINK_ABI } from './abi'

/**
 * Fetches prices from chainlink
 * https://data.chain.link/
 */
export class ChainlinkPriceProvider implements PriceProvider {
  constructor (
    private readonly apiToken: string
  ) {
  }

  private async fetchAsset (symbol: string): Promise<AssetPrice> {
    const contractAddress = CHAINLINK_SYMBOL_MAPPING[symbol].ticker

    const provider = new ethers.providers.InfuraProvider('mainnet', this.apiToken)
    const contract = new ethers.Contract(contractAddress, CHAINLINK_ABI, provider)

    const answer = await contract.latestAnswer()
    const decimals = await contract.decimals()
    let price = (new BigNumber(answer.toString())).shiftedBy(-decimals)

    if (CHAINLINK_SYMBOL_MAPPING[symbol].inverse) {
      price = new BigNumber(1).div(price)
    }

    const timestamp = await contract.latestTimestamp()

    return {
      asset: symbol,
      price,
      timestamp: (new BigNumber(timestamp.toString())).multipliedBy(1000)
    }
  }

  public async prices (symbols: string[]): Promise<AssetPrice[]> {
    return await Promise.all(symbols.map(async symbol => {
      return await this.fetchAsset(symbol)
    }))
  }
}
