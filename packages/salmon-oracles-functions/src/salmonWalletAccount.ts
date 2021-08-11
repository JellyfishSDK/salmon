import { WalletEllipticPair } from '@defichain/jellyfish-wallet'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { WhaleWalletAccount } from '@defichain/whale-api-wallet'
import { Network } from '@defichain/jellyfish-network'
import { P2WPKHTransactionBuilder, Prevout, PrevoutProvider } from '@defichain/jellyfish-transaction-builder/dist'
import BigNumber from 'bignumber.js'

/**
 * FallbackPrevoutProvider provides an abstraction that takes
 * a fallback prevout provider, and a preferred prevout provider.
 * If the preferred provider is empty or throws an error, the fallback
 * provider is used.
 */
export class FallbackPrevoutProvider implements PrevoutProvider {
  constructor (
    protected readonly fallbackPrevoutProvider: PrevoutProvider,
    protected readonly preferredPrevoutProvider?: PrevoutProvider
  ) {
  }

  async all (): Promise<Prevout[]> {
    if (this.preferredPrevoutProvider !== undefined) {
      try {
        const prevouts: Prevout[] = await this.preferredPrevoutProvider.all()
        if (prevouts.length > 0) {
          return prevouts
        }
      } catch {}
    }

    return await this.fallbackPrevoutProvider.all()
  }

  async collect (_: BigNumber): Promise<Prevout[]> {
    // TODO(fuxingloh): min balance filtering
    return await this.all()
  }
}

export class SalmonWalletAccount extends WhaleWalletAccount {
  protected readonly salmonPrevoutProvider: PrevoutProvider

  constructor (
    public readonly client: WhaleApiClient,
    walletEllipticPair: WalletEllipticPair,
    network: Network,
    preferredPrevoutProvider?: PrevoutProvider
  ) {
    super(client, walletEllipticPair, network, 10)
    this.salmonPrevoutProvider = new FallbackPrevoutProvider(this.prevoutProvider, preferredPrevoutProvider)
  }

  withTransactionBuilder (): P2WPKHTransactionBuilder {
    return new P2WPKHTransactionBuilder(this.feeRateProvider, this.salmonPrevoutProvider, {
      get: (_) => this
    })
  }
}
