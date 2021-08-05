import { Prevout, PrevoutProvider } from '@defichain/jellyfish-transaction-builder/dist'
import AWS from 'aws-sdk'
import BigNumber from 'bignumber.js'

const SEEK_MINUTES = 10
const VOUT_LOG_START = '\tINFO\t'
const isLambda = process.env.LAMBDA_TASK_ROOT !== undefined
const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME ?? ''
const logGroupPrefix = '/aws/lambda/'

function mapEventsToPrevouts (events: AWS.CloudWatchLogs.OutputLogEvents): Prevout[] {
  return events.flatMap(event => {
    try {
      const message = event.message
      if (message === undefined) {
        return []
      }

      const startPos: number = message.indexOf(VOUT_LOG_START)
      if (startPos === -1) {
        return []
      }

      const trimmedMessage = message.substring(startPos + VOUT_LOG_START.length)
      const prevout = JSON.parse(trimmedMessage)
      if (prevout.vout !== undefined &&
          prevout.txid !== undefined &&
          prevout.value !== undefined &&
          prevout.script !== undefined &&
          prevout.tokenId !== undefined) {
        return [prevout]
      }
    } catch {}

    return []
  })
}

async function resolvePrevoutsFromCloudWatchLogs (cloudwatchlogs: AWS.CloudWatchLogs,
  groupParams: AWS.CloudWatchLogs.DescribeLogStreamsRequest): Promise<Prevout[]> {
  return await new Promise<Prevout[]>((resolve, reject) => {
    cloudwatchlogs.describeLogStreams(groupParams, (_, groupData) => {
      const logStreams = groupData.logStreams
      if (logStreams === undefined) {
        reject(new Error('Log stream undefined'))
        return
      }

      const params: AWS.CloudWatchLogs.GetLogEventsRequest = {
        logGroupName: groupParams.logGroupName,
        logStreamName: logStreams[0].logStreamName ?? '',
        startTime: Date.now() - (1000 * 60 * SEEK_MINUTES)
      }

      cloudwatchlogs.getLogEvents(params, (_, data) => {
        const mapped = mapEventsToPrevouts(data.events ?? [])
        if (mapped.length === 0) {
          reject(new Error('No prevouts available'))
          return
        }

        // Return strictly the latest prevout as upstream may
        // choose in any order
        resolve(mapped.slice(-1))
      })
    })
  })
}

export class LambdaPrevoutProvider implements PrevoutProvider {
  async all (): Promise<Prevout[]> {
    if (!isLambda) {
      return []
    }

    const cloudwatchlogs = new AWS.CloudWatchLogs({ apiVersion: '2014-03-28' })
    const groupParams: AWS.CloudWatchLogs.DescribeLogStreamsRequest = {
      logGroupName: `${logGroupPrefix}${functionName}`,
      descending: true,
      orderBy: 'LastEventTime'
    }
    return await resolvePrevoutsFromCloudWatchLogs(cloudwatchlogs, groupParams)
  }

  async collect (_: BigNumber): Promise<Prevout[]> {
    // TODO(fuxingloh): min balance filtering
    return await this.all()
  }
}
