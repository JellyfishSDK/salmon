const waitForExpect = require("wait-for-expect");
const { mockFinnhubbEndpoints } = require("./mocks_finnhubb_price_protection");
const { finnhubb, getEnvironmentConfig } = require("../../../dist");
const { oracleOwner, client, setupOracle } = require("./setup");
const { WhaleOraclesManager } = require('@defichain/salmon-oracles-functions')

describe("e2e single price protection", () => {
  it("should protect from price fluctuation", async () => {
    process.env.OCEAN_URL = "http://localhost:3001";
    process.env.NETWORK = "regtest";
    process.env.CURRENCY = "USD";
    process.env.SYMBOLS = "TSLA";
    process.env.PRIVATE_KEY = oracleOwner.privKey;

    const txid = await client.wallet.sendToAddress(oracleOwner.address, 1);
    await client.wallet.sendToAddress(oracleOwner.address, 1);
    await waitForExpect(async () => {
      const confirms = (await client.wallet.getTransaction(txid)).confirmations;
      expect(confirms).toBeGreaterThanOrEqual(2);
    }, 10000);

    mockFinnhubbEndpoints();
    const finnhubbOracleId = await setupOracle();
    process.env.ORACLE_ID = finnhubbOracleId;
    process.env.API_TOKEN = "API_TOKEN";
    await finnhubb({});

    const env = await getEnvironmentConfig()
    const oraclesManager = WhaleOraclesManager.withWhaleClient(env.oceanUrl, env.network, env.privateKey)
  
    await waitForExpect(async () => {
      const existing = await oraclesManager.whaleClient.oracles.getPriceFeed(env.oracleId, 
        process.env.SYMBOLS[0], process.env.CURRENCY, 1)
  
      expect(existing.length).toStrictEqual(1)
    }, 30000)
   
    await finnhubb({})
    // await waitForExpect(async () => {
    //   await expect().resolves.not.toThrow()
    // }, 10000);
  });
});
