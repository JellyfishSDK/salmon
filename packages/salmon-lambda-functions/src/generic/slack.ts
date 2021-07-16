import { Bech32 } from '@defichain/jellyfish-crypto'
import { OraclesManager } from '@defichain/salmon-oracles-functions'
import { WhaleApiClient } from '@defichain/whale-api-client'
import BigNumber from 'bignumber.js'
import fetch from 'node-fetch'
import { EnvironmentConfig } from './environment'

export async function checkBalanceAndNotify (oraclesManager: OraclesManager, env: EnvironmentConfig): Promise<void> {
  const pubKey = await oraclesManager.walletAccount.publicKey()
  const address = Bech32.fromPubKey(pubKey, 'df')

  const whaleClient = new WhaleApiClient({
    url: env.oceanUrl,
    network: env.network
  })

  const balance = new BigNumber(await whaleClient.address.getBalance(address))
  if (balance.lt(2.0)) {
    const message = {
      channel: 'oracle-balance',
      username: 'Price Oracle',
      text: `Oracle Address ${address} is running low on funds! Only ${balance.toString()} DFI left`,
      icon_emoji: ':dollar:',
      attachments: []
    }

    await fetch(env.slackWebhookUrl, {
      method: 'POST',
      body: JSON.stringify(message)
    })
  }
}
