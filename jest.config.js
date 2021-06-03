module.exports = {
  preset: 'ts-jest',
  testRegex: '((\\.|/)(e2e|test|spec))\\.[jt]sx?$',
  moduleNameMapper: {
    '@defichain/salmon-oracles-functions': '<rootDir>/packages/salmon-oracles-functions/src'
  },
  testTimeout: 240000
}
