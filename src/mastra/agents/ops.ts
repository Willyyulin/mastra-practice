import { Agent } from '@mastra/core/agent'
import { sonnet, promptCache } from '../llm/databricks'
import { getHostMetrics } from '../tools/host-metrics'
import { rebootHost } from '../tools/reboot-host'
import { readOnly } from '../tools/readonly'
import { listLargeFiles } from '../tools/large-files'


const skillsDir = process.env.SKILLS_DIR ?? `${process.cwd()}/skills`
export const opsAgent = new Agent({
  id: 'ops',
  name: '維運助理',
  instructions: '你是維運助理，用台灣繁體中文回答。',
  model: sonnet(),   // 課程第 2 課寫的是 'anthropic/claude-sonnet-5-5'，我們換成第 4 步的函式
  tools: readOnly({ getHostMetrics, listLargeFiles, rebootHost }),
  defaultOptions: {
  ...promptCache,
  delegation: {
    messageFilter: ({ prompt }) => [{ role: 'user', content: prompt }],
  },
  },
  skills: [`${skillsDir}/disk-full`, `${skillsDir}/slow-host`]
})