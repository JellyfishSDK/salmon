const finnhubbHandler = require('../../../dist/finnhubb').handler
const tiingoHandler = require('../../../dist/tiingo').handler
const iexHandler = require('../../../dist/iexcloud').handler
const JsonRpcClient = require('@defichain/jellyfish-api-jsonrpc').JsonRpcClient
const GenesisKeys = require('@defichain/testcontainers').GenesisKeys

const fetchOraclesList = async () => {
  const client = new JsonRpcClient('http://playground:playground@localhost:3003')
  return await client.oracle.listOracles()
}

beforeAll(async () => {
    process.env.OCEAN_URL = 'http://localhost:3001'
    process.env.NETWORK = 'regtest'
    process.env.CURRENCY = 'USD'
    process.env.SYMBOLS = 'TSLA,AAPL,FB'
    process.env.PRIVATE_KEY = GenesisKeys[GenesisKeys.length - 1].owner.privKey
})

afterAll(async () => {
  expect(1).toStrictEqual(1)
})

describe('e2e', () => {
  it('should run the finnhubb lambda function', async () => {
    // !TODO: Remove this
    nock('http://localhost:3001/v0/regtest/address/bcrt1qyeuu9rvq8a67j86pzvh5897afdmdjpyankp4mu/transactions')
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

    process.env.ORACLE_ID = (await fetchOraclesList())[0]
    process.env.API_TOKEN = 'FINNHUBB_TOKEN'
    finnhubbHandler({})
  })
  
  it('should run the tiingo lambda function', async () => {
    process.env.ORACLE_ID = (await fetchOraclesList())[1]
    process.env.API_TOKEN = 'TIINGO_TOKEN'
    tiingoHandler({})
  })

  it('should run the iexcloud lambda function', async () => {
    process.env.ORACLE_ID = (await fetchOraclesList())[2]
    process.env.API_TOKEN = 'IEX_TOKEN'
    iexHandler({})
  })
})
