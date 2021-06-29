const waitForExpect = require("wait-for-expect");
const { mockFinnhubbEndpoints } = require("./mocks_finnhubb");
const finnhubb = require("../../../dist/finnhubb");
const { oracleOwner, client, setupOracle } = require("./setup");

describe("e2e single finnhubb", () => {
  it("should run finnhubb provider lambda function", async () => {
    process.env.OCEAN_URL = "http://localhost:3001";
    process.env.NETWORK = "regtest";
    process.env.CURRENCY = "USD";
    process.env.SYMBOLS = "TSLA,AAPL,FB";
    process.env.PRIVATE_KEY = oracleOwner.privKey;

    const txid = await client.wallet.sendToAddress(oracleOwner.address, 1);
    await waitForExpect(async () => {
      const confirms = (await client.wallet.getTransaction(txid)).confirmations;
      expect(confirms).toBeGreaterThanOrEqual(2);
    }, 10000);

    mockFinnhubbEndpoints();
    const finnhubbOracleId = await setupOracle();
    process.env.ORACLE_ID = finnhubbOracleId;
    process.env.API_TOKEN = "API_TOKEN";
    await finnhubb.handler({});

    await waitForExpect(async () => {
      expect(
        (await client.oracle.getOracleData(finnhubbOracleId)).tokenPrices.length
      ).toBeGreaterThanOrEqual(3);
    }, 10000);

    const oracleData = await client.oracle.getOracleData(finnhubbOracleId);
    expect(oracleData.tokenPrices[0].amount).toStrictEqual(120);
    expect(oracleData.tokenPrices[1].amount).toStrictEqual(330);
    expect(oracleData.tokenPrices[2].amount).toStrictEqual(605);
  });
});