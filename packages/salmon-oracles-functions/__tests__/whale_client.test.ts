import nock from 'nock'
import { AssetPrice, PriceManager, PriceProvider, PriceSourceConfig } from '@defichain/salmon-price-functions'
import { OraclesManager, SalmonWalletHDNode } from '@defichain/salmon-oracles-functions'
import { GenesisKeys } from '@defichain/testcontainers'
import BigNumber from 'bignumber.js'
import { SmartBuffer } from 'smart-buffer'
import { CTransactionSegWit } from '@defichain/jellyfish-transaction'
import { WIF } from '@defichain/jellyfish-crypto'

describe('whale client', () => {
  afterEach(() => {
    jest.clearAllMocks()
    nock.cleanAll()
  })

  it('should set a price', async () => {
    nock('http://127.0.0.1/v0/regtest')
      .post('/transactions', body => {
        const buffer = SmartBuffer.fromBuffer(Buffer.from(body.hex, 'hex'))
        const composable = new CTransactionSegWit(buffer)
        const txSegwit = composable.toObject()
        const txnData = txSegwit.vout[0].script.stack[1].tx.data
        expect(txnData.tokens[0].token).toStrictEqual('TSLA')
        expect(txnData.tokens[0].prices[0].amount).toStrictEqual(new BigNumber(625.22))
        expect(txnData.timestamp).toStrictEqual(new BigNumber(1480446908666))
        return true
      })
      .reply(200, function (_) {
        return {}
      })

    nock('http://127.0.0.1/v0/regtest/address/bcrt1qyeuu9rvq8a67j86pzvh5897afdmdjpyankp4mu/transactions')
      .get('/unspent?size=10')
      .reply(200, function (_) {
        return {
          data:
          [{
            id: '03280abd3d3ae8dc294c1a572cd7912c3c3e53044943eac62c2f6c4687c87f1000000001',
            hid: 'b115e5ea70e06e0c41a0ba8417ca6c311e29e9f590fc33d61b6b94e623baf207',
            sort: '0000000003280abd3d3ae8dc294c1a572cd7912c3c3e53044943eac62c2f6c4687c87f1000000001',
            block: {
              hash: 'd744db74fb70ed42767ae028a129365fb4d7de54ba1b6575fb047490554f8a7b',
              height: 0
            },
            script: {
              type: 'witness_v0_keyhash',
              hex: '00142679c28d803f75e91f41132f4397dd4b76d9049d'
            },
            vout: {
              txid: '03280abd3d3ae8dc294c1a572cd7912c3c3e53044943eac62c2f6c4687c87f10',
              n: 1,
              value: '10.00000000'
            }
          }]
        }
      })

    nock('http://127.0.0.1/v0/regtest/transactions')
      .get('/estimate-fee?confirmationTarget=10')
      .reply(200, function (_) {
        return { data: 0.00005 }
      })

    class MockPriceProvider implements PriceProvider {
      public async prices (symbols: string[]): Promise<AssetPrice[]> {
        return [{
          asset: 'TSLA',
          price: new BigNumber(625.22),
          timestamp: new BigNumber(1480446908666)
        }]
      }
    }

    const config: PriceSourceConfig = {
      symbols: ['TSLA']
    }

    const priceManager = new PriceManager(config, new MockPriceProvider())
    const prices = await priceManager.fetchAssetPrices()

    const oraclesManager = OraclesManager.withWhaleClient('http://127.0.0.1', 'regtest',
      GenesisKeys[GenesisKeys.length - 1].owner.privKey)
    await oraclesManager.updatePrices('d1248472d78681257637f6cafb6eab9b89f4a64eb8c425208b52258994351d06',
      prices.map(assetPrice => ({
        token: assetPrice.asset,
        prices: [{ currency: 'USD', amount: assetPrice.price }]
      })), new BigNumber(1480446908666))
  })
})

describe('salmon wallet hd node', () => {
  it('only returns pubkey', async () => {
    const ellipticPair = WIF.asEllipticPair(GenesisKeys[GenesisKeys.length - 1].owner.privKey)
    const hdNode = new SalmonWalletHDNode(ellipticPair)
    expect(await hdNode.publicKey()).toStrictEqual(await ellipticPair.publicKey())
    await expect(hdNode.privateKey()).rejects.toThrow('Attempting to retrieve private key')
    await expect(hdNode.sign(Buffer.alloc(0))).rejects.toThrow('Attempting to sign')
    await expect(hdNode.verify(Buffer.alloc(0), Buffer.alloc(0))).rejects.toThrow('Attempting to verify')
    await expect(hdNode.signTx({
      version: 0,
      vin: [],
      vout: [],
      lockTime: 0
    }, [])
    ).rejects.toThrow('Attempting to signTx')
  })
})
