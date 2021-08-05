import { Prevout, PrevoutProvider } from '@defichain/jellyfish-transaction-builder/dist'
import AWS from 'aws-sdk'
import BigNumber from 'bignumber.js'

const SEEK_MINUTES = 10
const VOUT_LOG_START = '\tINFO\t'
const isLambda = process.env.LAMBDA_TASK_ROOT !== undefined
const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME ?? ''
const logGroupPrefix = '/aws/lambda/'

export class LambdaPrevoutProvider implements PrevoutProvider {
  async all (): Promise<Prevout[]> {
    if (!isLambda) {
      return []
    }

    const logGroupName = `${logGroupPrefix}${functionName}`
    const cloudwatchlogs = new AWS.CloudWatchLogs({ apiVersion: '2014-03-28' })
    return await new Promise<Prevout[]>((resolve, reject) => {
      const groupParams = {
        logGroupName: logGroupName,
        descending: true,
        orderBy: 'LastEventTime'
      }

      cloudwatchlogs.describeLogStreams(groupParams, (_, groupData) => {
        const logStreams = groupData.logStreams
        if (logStreams === undefined) {
          reject(new Error('Log stream undefined'))
          return
        }

        const params = {
          logGroupName: logGroupName,
          logStreamName: logStreams[0].logStreamName ?? '',
          startTime: Date.now() - (1000 * 60 * SEEK_MINUTES)
        }
        cloudwatchlogs.getLogEvents(params, (_, data) => {
          const mapped = (data.events ?? []).flatMap(x => {
            try {
              const message = x.message
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

          if (mapped.length === 0) {
            reject(new Error('No prevouts available'))
            return
          }

          // Return strictly the latest prevout as upstream may
          // choose in any order
          resolve(mapped.reverse()[0])
        })
      })
    })
  }

  async collect (_: BigNumber): Promise<Prevout[]> {
    // TODO(fuxingloh): min balance filtering
    return await this.all()
  }
}
