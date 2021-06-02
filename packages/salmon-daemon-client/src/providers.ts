export interface SendRawTransactionProvider {
  /**
     * @return {string} transaction id
     */
  sendRawTransaction: (rawTxn: string) => Promise<string>
}
