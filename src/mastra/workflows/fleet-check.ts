import { createStep, createWorkflow } from '@mastra/core/workflows'
import { z } from 'zod'
import { hostCheck } from './host-check'

const HOSTS = ['web-01', 'web-02', 'db-01']
const WINDOW_MINUTES = 30

const expandHosts = createStep({
  id: 'expand-hosts',
  inputSchema: z.object({}),
  outputSchema: z.array(z.object({ host: z.string(), minutes: z.number() })),
  execute: async () => HOSTS.map((host) => ({ host, minutes: WINDOW_MINUTES })),
})

const summarize = createStep({
  id: 'summarize',
  inputSchema: z.array(z.object({ report: z.string(), needsAttention: z.boolean() })),
  outputSchema: z.object({ summary: z.string(), attention: z.number() }),
  execute: async ({ inputData }) => {
    const flagged = inputData.filter((r) => r.needsAttention)
    const summary = [
      `巡檢 ${inputData.length} 台，${flagged.length} 台要注意`,
      ...flagged.map((r) => r.report),
    ].join('\n\n')
    console.log(summary)
    return { summary, attention: flagged.length }
  },
})

export const fleetCheck = createWorkflow({
  id: 'fleet-check',
  inputSchema: z.object({}),
  outputSchema: z.object({ summary: z.string(), attention: z.number() }),
  schedule: { cron: '*/30 * * * *', timezone: 'Asia/Taipei', inputData: {} },
})
  .then(expandHosts)
  .foreach(hostCheck, { concurrency: 3 })
  .then(summarize)
  .commit()