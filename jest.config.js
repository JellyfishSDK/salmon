module.exports = {
  preset: 'ts-jest',
  testRegex: '((\\.|/)(e2e|test|spec))\\.[jt]sx?$',
  moduleNameMapper: {
    '@defichain/salmon-oracles-functions': '<rootDir>/packages/salmon-oracles-functions/src',
    '@defichain/salmon-price-functions': '<rootDir>/packages/salmon-price-functions/src',
    '@defichain/salmon-provider-finnhubb': '<rootDir>/packages/salmon-provider-finnhubb/src',
    '@defichain/salmon-provider-tiingo': '<rootDir>/packages/salmon-provider-tiingo/src',
    '@defichain/salmon-provider-iexcloud': '<rootDir>/packages/salmon-provider-iexcloud/src',
    '@defichain/salmon-lambda-functions': '<rootDir>/packages/salmon-lambda-functions/src'
  },
  testTimeout: 240000,
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '.*/.*.spec/.*',
    '.*/__tests__/.*'
  ]
}
