import { OraclesManager } from '@defichain/salmon-oracles-functions'
import fetch from 'node-fetch'
import { EnvironmentConfig } from './environment'

export async function checkBalanceAndNotify (oraclesManager: OraclesManager, env: EnvironmentConfig): Promise<void> {
  const balance = await oraclesManager.getBalance(env.oceanUrl, env.network)
  if (balance.lt(2.0)) {
    const address = await oraclesManager.getAddress()

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
