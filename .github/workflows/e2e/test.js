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
