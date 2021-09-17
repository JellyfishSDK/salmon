import nock from 'nock'

const iexResponse = `[
  {
    "symbol":"TSLA",
    "sector":"consumerdurables",
    "securityType":"cs",
    "bidPrice":0,
    "bidSize":0,
    "askPrice":0,
    "askSize":0,
    "lastUpdated":1623096987115,
    "lastSalePrice":607,
    "lastSaleSize":10,
    "lastSaleTime": ${Date.now()},
    "volume":480662
  },
  {
    "symbol":"AAPL",
    "sector":"electronictechnology",
    "securityType":"cs",
    "bidPrice":0,
    "bidSize":0,
    "askPrice":0,
    "askSize":0,
    "lastUpdated":1623099600004,
    "lastSalePrice":150,
    "lastSaleSize":100,
    "lastSaleTime": ${Date.now()},
    "volume":1401779
  },
  {
    "symbol":"FB",
    "sector":"technologyservices",
    "securityType":"cs",
    "bidPrice":0,
    "bidSize":0,
    "askPrice":0,
    "askSize":0,
    "lastUpdated":1623097044336,
    "lastSalePrice":350,
    "lastSaleSize":15,
    "lastSaleTime": ${Date.now()},
    "volume":598873
  }
]`

export const mockIexcloudEndpoints = (): void => {
  nock('https://cloud.iexapis.com/stable/tops')
    .get('?symbols=TSLA,AAPL,FB&token=API_TOKEN')
    .reply(200, function (_) {
      return iexResponse
    })
}
