import { P2WPKHTransactionBuilder } from '@defichain/jellyfish-transaction-builder'
import { CTransactionSegWit, Script, TokenPrice, TransactionSegWit } from '@defichain/jellyfish-transaction'
import BigNumber from 'bignumber.js'
import { WalletAccount } from '@defichain/jellyfish-wallet'

export class OraclesManager {
  constructor (
    private readonly broadcastHex: (rawTx: { hex: string }) => Promise<string>,
    private readonly builder: P2WPKHTransactionBuilder,
    public readonly walletAccount: WalletAccount
  ) {
  }

  /**
   * Returns the script for the price oracle owner.
   *
   * @return {Promise<Script>}
   */
  public async getChangeScript (): Promise<Script> {
    return await this.walletAccount.getScript()
  }

  /**
   * Pushes prices to the price oracle on the blockchain.
   *
   * @param {string} oracleId
   * @param {string} token
   * @param {TokenPrice[]} tokenPrices
   * @param {BigNumber} [timestamp = new BigNumber(Math.floor(Date.now() / 1000))]
   * @return {Promise<string|undefined>}
   */
  async updatePrices (
    oracleId: string,
    tokenPrices: TokenPrice[],
    timestamp: BigNumber = new BigNumber(Math.floor(Date.now() / 1000))
  ): Promise<string | undefined> {
    if (tokenPrices.length === 0) {
      return
    }

    const txnData = {
      oracleId,
      timestamp,
      tokens: tokenPrices
    }

    const setOracleDataTxn: TransactionSegWit = await this.builder.oracles.setOracleData(txnData, await this.getChangeScript())
    const transactionSegWit: CTransactionSegWit = new CTransactionSegWit(setOracleDataTxn)
    return await this.broadcastHex({ hex: transactionSegWit.toHex() })
  }
}
