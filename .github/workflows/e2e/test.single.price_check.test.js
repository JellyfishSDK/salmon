const waitForExpect = require("wait-for-expect");
const { mockFinnhubbEndpoints } = require("./mocks_finnhubb");
const { finnhubb, getEnvironmentConfig, fetchPrices } = require("../../../dist");
const { oracleOwner, client, setupOracle } = require("./setup");
const { FinnhubbPriceProvider } = require('@defichain/salmon-provider-finnhubb')
const { WhaleOraclesManager } = require('@defichain/salmon-oracles-functions')
const BigNumber = require('bignumber.js')

describe("e2e single finnhubb", () => {
  it("should run finnhubb provider lambda function", async () => {
    process.env.OCEAN_URL = "http://localhost:3001"
    process.env.NETWORK = "regtest"
    process.env.CURRENCY = "USD"
    process.env.SYMBOLS = "TSLA,AAPL,FB"
    process.env.PRIVATE_KEY = oracleOwner.privKey

    const txid = await client.wallet.sendToAddress(oracleOwner.address, 1)
    await waitForExpect(async () => {
      const confirms = (await client.wallet.getTransaction(txid)).confirmations
      expect(confirms).toBeGreaterThanOrEqual(2)
    }, 10000)

    mockFinnhubbEndpoints();
    const finnhubbOracleId = await setupOracle()
    process.env.ORACLE_ID = finnhubbOracleId
    process.env.API_TOKEN = "API_TOKEN"

    await finnhubb({});    

    await waitForExpect(async () => {
      expect(
        (await client.oracle.getOracleData(finnhubbOracleId)).tokenPrices.length
      ).toBeGreaterThanOrEqual(3)
    }, 10000)

    // Check that we don't submit the prices again        
    const apiToken = process.env.API_TOKEN ?? ''
    const finnhubbProvider = new FinnhubbPriceProvider(apiToken)

    const env = await getEnvironmentConfig()
    const prices = await fetchPrices(env, finnhubbProvider)
    expect(prices.length).toStrictEqual(3)

    const oraclesManager = WhaleOraclesManager.withWhaleClient(env.oceanUrl, env.network, env.privateKey)
    const tokenPrices = prices.map(assetPrice => ({
      token: assetPrice.asset, prices: [{ currency: env.currency, amount: assetPrice.price }]
    }))
 
    await waitForExpect(async () => {
      const filteredTokenPrices = []
      for(const tokenPrice of tokenPrices) {
        const existing = await oraclesManager.whaleClient.oracles.getPriceFeed(env.oracleId, tokenPrice.token,
          tokenPrice.prices[0].currency, 1)
  
        if (existing.length === 0) {
          filteredTokenPrices.push(tokenPrice)
        } else {
          const isEqual = new BigNumber(existing[0].amount).eq(tokenPrice.prices[0].amount)
          if(!isEqual) {
            filteredTokenPrices.push(tokenPrice)
          }
        }
      }
  
      expect(filteredTokenPrices.length).toStrictEqual(1)
    }, 10000)

    const oracleData = await client.oracle.getOracleData(finnhubbOracleId)
    expect(oracleData.tokenPrices[0].amount).toStrictEqual(120)
    expect(oracleData.tokenPrices[1].amount).toStrictEqual(330)
    expect(oracleData.tokenPrices[2].amount).toStrictEqual(605)
  });
});
