import { WalletAccount } from '@defichain/jellyfish-wallet'
import { WhaleApiClient } from '@defichain/whale-api-client'
import BigNumber from 'bignumber.js'
import fetch from 'node-fetch'
import { EnvironmentConfig } from './environment'

export async function checkBalanceAndNotify (walletAccount: WalletAccount, whaleClient: WhaleApiClient,
  env: EnvironmentConfig): Promise<void> {
  const address = await walletAccount.getAddress()
  const balance = await whaleClient.address.getBalance(address)
  if (new BigNumber(balance).lt(2.0)) {
    await sendSlackMessage(`Oracle Address *${address}* is running low on funds! Only *${balance}* DFI left`,
      ':dollar:', env)
  }
}

export async function sendSlackMessage (text: string, icon: string, env: EnvironmentConfig): Promise<void> {
  const message = {
    channel: 'oracle-balance',
    username: 'Price Oracle',
    text: text,
    icon_emoji: icon,
    attachments: []
  }

  await fetch(env.slackWebhookUrl, {
    method: 'POST',
    body: JSON.stringify(message)
  })
}
