import aws from 'aws-sdk'

export interface EnvironmentConfig {
  oceanUrl: string
  slackWebhookUrl: string
  network: string
  oracleId: string
  currency: string
  symbols: string[]
  intervalSeconds: number
  privateKey: string
  closeThreshold: number
  farThreshold: number
}

export const getEnvironmentConfig = async (): Promise<EnvironmentConfig> => {
  let privateKey = process.env.PRIVATE_KEY ?? ''

  if (process.env.PRIVATE_KEY_SSM_KEY !== undefined) {
    const paramConfig = {
      Name: process.env.PRIVATE_KEY_SSM_KEY,
      WithDecryption: true
    }

    const parameterStore = new aws.SSM()
    const param = await parameterStore.getParameter(paramConfig).promise()
    privateKey = param.Parameter?.Value ?? ''
  }

  return {
    oceanUrl: process.env.OCEAN_URL ?? 'https://localhost',
    network: process.env.NETWORK ?? 'regtest',
    oracleId: process.env.ORACLE_ID ?? '',
    currency: process.env.CURRENCY ?? 'USD',
    symbols: (process.env.SYMBOLS ?? '').split(','),
    intervalSeconds: parseInt(process.env.INTERVAL_SECONDS ?? '300'),
    privateKey,
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL ?? '',
    closeThreshold: parseFloat(process.env.CLOSE_THRESHOLD ?? '0.3'),
    farThreshold: parseFloat(process.env.FAR_THRESHOLD ?? '0.3')
  }
}
