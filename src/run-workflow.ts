import { mastra } from './mastra'

const host = process.argv[2] ?? 'web-01'
const run = await mastra.getWorkflow('hostCheck').createRun()
const result = await run.start({ inputData: { host, minutes: 30 } })

console.log('狀態:', result.status)
if (result.status === 'success') {
  console.log(result.result.report)
  console.log('需要注意:', result.result.needsAttention)
}