import { MasterNodeRegTestContainer, GenesisKeys } from '@defichain/testcontainers'
import { fundEllipticPair, sendTransaction } from './test.utils'
import { getProviders, MockProviders, MockWalletAccount } from './provider.mock'
import { OraclesManager } from '../src'
import { dSHA256, WIF } from '@defichain/jellyfish-crypto'
import { P2WPKHTransactionBuilder } from '@defichain/jellyfish-transaction-builder/dist'
import { SmartBuffer } from 'smart-buffer'
import { BigNumber } from 'bignumber.js'
import { CTransaction, Transaction } from '@defichain/jellyfish-transaction'
import { WalletClassic } from '@defichain/jellyfish-wallet-classic'

export function calculateTxid (transaction: Transaction): string {
  const buffer = new SmartBuffer()
  new CTransaction(transaction).toBuffer(buffer)
  return dSHA256(buffer.toBuffer()).reverse().toString('hex')
}

const container = new MasterNodeRegTestContainer()
let providers: MockProviders
let builder: P2WPKHTransactionBuilder

beforeAll(async () => {
  await container.start()
  await container.waitForReady()
  await container.waitForWalletCoinbaseMaturity()
  providers = await getProviders(container)
  providers.setEllipticPair(WIF.asEllipticPair(GenesisKeys[GenesisKeys.length - 1].owner.privKey))
  builder = new P2WPKHTransactionBuilder(providers.fee, providers.prevout, {
    get: (_) => providers.ellipticPair
  })

  await container.waitForWalletBalanceGTE(100)
})

afterAll(async () => {
  await container.stop()
})

describe('basic price oracles', () => {
  beforeEach(async () => {
    // Fund 10 DFI UTXO
    await fundEllipticPair(container, providers.ellipticPair, 10)
    await providers.setupMocks() // required to move utxos
  })

  it('should set a price', async () => {
    const oraclesManager = new OraclesManager(
      async hex => {
        const txid = await container.call('sendrawtransaction', [hex])
        await container.generate(1)
        return txid
      },
      new P2WPKHTransactionBuilder(providers.fee, providers.prevout, {
        get: (_) => providers.ellipticPair
      }),
      new MockWalletAccount(new WalletClassic(providers.ellipticPair))
    )

    // Appoint Oracle
    const script = await oraclesManager.getChangeScript()
    const appointTxn = await builder.oracles.appointOracle({
      script: script,
      weightage: 1,
      priceFeeds: [
        {
          token: 'TEST',
          currency: 'USD'
        }
      ]
    }, script)

    await sendTransaction(container, appointTxn)

    const oracleId = calculateTxid(appointTxn)
    await oraclesManager.updatePrices(oracleId, [{ token: 'TEST', prices: [{ currency: 'USD', amount: new BigNumber(0.1) }] }])

    // Ensure oracle is updated and has correct values
    const getOracleDataResult = await container.call('getoracledata', [oracleId])
    expect(getOracleDataResult.priceFeeds.length).toStrictEqual(1)
    expect(getOracleDataResult.priceFeeds[0].token).toStrictEqual('TEST')
    expect(getOracleDataResult.priceFeeds[0].currency).toStrictEqual('USD')
    expect(getOracleDataResult.tokenPrices[0].token).toStrictEqual('TEST')
    expect(getOracleDataResult.tokenPrices[0].currency).toStrictEqual('USD')
    expect(getOracleDataResult.tokenPrices[0].amount).toStrictEqual(0.1)

    // Set with explicit timestamp
    await oraclesManager.updatePrices(oracleId, [{ token: 'TEST', prices: [{ currency: 'USD', amount: new BigNumber(0.2) }] }], new BigNumber(1623225892))

    const getOracleDataSecondResult = await container.call('getoracledata', [oracleId])
    expect(getOracleDataSecondResult.tokenPrices[0].amount).toStrictEqual(0.2)
    expect(getOracleDataSecondResult.tokenPrices[0].timestamp).toStrictEqual(1623225892)
  })

  it('should do nothing', async () => {
    const broadcast = async (hex: string): Promise<string> => {
      const txid = await container.call('sendrawtransaction', [hex])
      await container.generate(1)
      return txid
    }

    const broadcastMock = jest.fn(broadcast)

    const oraclesManager = new OraclesManager(
      broadcastMock,
      new P2WPKHTransactionBuilder(providers.fee, providers.prevout, {
        get: (_) => providers.ellipticPair
      }),
      new MockWalletAccount(new WalletClassic(providers.ellipticPair))
    )

    await oraclesManager.updatePrices('', [])

    expect(broadcastMock).not.toHaveBeenCalled()
  })
})
