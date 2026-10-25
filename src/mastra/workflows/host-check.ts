import { createStep, createWorkflow } from '@mastra/core/workflows'
import { z } from 'zod'
import { getHostMetrics } from '../tools/host-metrics'

const CPU_HIGH = 80
const MEM_HIGH = 90

// 工具直接變成一個 step：輸入輸出格式沿用工具的 schema
const fetchMetrics = createStep(getHostMetrics)

const judge = createStep({
  id: 'judge',
  inputSchema: z.object({ cpu: z.number(), mem: z.number() }),
  outputSchema: z.object({
    host: z.string(), cpu: z.number(), mem: z.number(),
    cpuHigh: z.boolean(), memHigh: z.boolean(),
  }),
  execute: async ({ inputData, getInitData }) => {
    const { host } = getInitData<{ host: string }>()   // workflow 一開始收到的輸入
    return {
      host,
      cpu: inputData.cpu,
      mem: inputData.mem,
      cpuHigh: inputData.cpu > CPU_HIGH,
      memHigh: inputData.mem > MEM_HIGH,
    }
  },
})

const report = createStep({
  id: 'report',
  inputSchema: z.object({
    host: z.string(), cpu: z.number(), mem: z.number(),
    cpuHigh: z.boolean(), memHigh: z.boolean(),
  }),
  outputSchema: z.object({ report: z.string(), needsAttention: z.boolean() }),
  execute: async ({ inputData: d }) => {
    const lines = [
      `${d.host} 最近 30 分鐘`,
      `CPU ${d.cpu}%${d.cpuHigh ? '，偏高' : ''}`,
      `記憶體 ${d.mem}%${d.memHigh ? '，偏高' : ''}`,
    ]
    return { report: lines.join('\n'), needsAttention: d.cpuHigh || d.memHigh }
  },
})

export const hostCheck = createWorkflow({
  id: 'host-check',
  inputSchema: z.object({ host: z.string(), minutes: z.number().default(30) }),
  outputSchema: z.object({ report: z.string(), needsAttention: z.boolean() }),
})
  .then(fetchMetrics)
  .then(judge)
  .then(report)
  .commit()