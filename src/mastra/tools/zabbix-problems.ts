import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { gatewayMcp } from '../mcp/gateway'

// Zabbix 的嚴重度 0–5，照順序對應中文
const SEVERITY = ['未分類', '資訊', '警告', '一般', '高', '災難'] as const
// 向 Zabbix 一次最多拿幾筆；拿回來在這裡排序、精簡，只把 limit 筆交給模型
const FETCH_LIMIT = 200

type Group = { groupid: string; name: string }
type Problem = { eventid: string; name: string; severity: string; clock: string; acknowledged: string }

// 從 gateway 的工具清單拿一個 Zabbix 工具，包成「給參數、回結果」的函式
async function zabbixCall(name: string) {
  const all = await gatewayMcp.listTools()
  const tool = all[`gw_zabbix-mcp-server__${name}`]
  if (!tool?.execute) throw new Error(`gateway 上找不到 Zabbix 工具 ${name}`)
  return (input: Record<string, unknown>) => tool.execute!(input, {} as never)
}

const taipei = (unixSec: number) =>
  new Date(unixSec * 1000).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false })

export const zabbixProblems = createTool({
  id: 'zabbix-problems',
  description:
    '查某一類主機（用主機群組名稱的關鍵字，例如 waf、db、redis）目前還沒恢復的 Zabbix 告警。' +
    '內部會先找群組再查 problem，回傳已排序、已精簡的清單；問「某類主機有沒有告警」直接用這個，不要自己呼叫 hostgroup_get 或 problem_get。',
  inputSchema: z.object({
    keyword: z.string().min(1).describe('主機群組名稱的關鍵字，區分大小寫，例如 waf'),
    minSeverity: z.number().int().min(0).max(5).default(2).describe('最低嚴重度：0 未分類、1 資訊、2 警告、3 一般、4 高、5 災難'),
    limit: z.number().int().min(1).max(50).default(20).describe('最多回幾筆；先排嚴重度高的，再排最近發生的'),
  }),
  outputSchema: z.object({
    groups: z.array(z.string()).describe('符合關鍵字的群組名稱'),
    total: z.number().describe('符合條件的告警總數（最多算到 200）'),
    totalCapped: z.boolean().describe('true 表示實際不只 total 筆，只是撞到上限'),
    asOf: z.string().describe('這次查詢的台灣時間，用來算告警掛多久、判斷日期先後'),
    returned: z.number(),
    problems: z.array(z.object({
      name: z.string(),
      severity: z.string(),
      since: z.string().describe('台灣時間'),
      ageDays: z.number().describe('掛了幾天'),
      acknowledged: z.boolean(),
    })),
  }),

  execute: async ({ keyword, minSeverity, limit }) => {
    const hostgroupGet = await zabbixCall('hostgroup_get')
    const problemGet = await zabbixCall('problem_get')

    const g = (await hostgroupGet({ search: { name: keyword }, output: 'extend' })) as { groups?: Group[] }
    const groups = g.groups ?? []
    if (groups.length === 0) return { groups: [], total: 0, returned: 0, problems: [] ,totalCapped: false, asOf: taipei(Math.floor(Date.now() / 1000))}

    const severities = SEVERITY.map((_, i) => i).filter((i) => i >= minSeverity)
    const p = (await problemGet({
      groupids: groups.map((x) => x.groupid),
      severities,
      limit: FETCH_LIMIT,
      output: 'extend',
    })) as { problems?: Problem[] }

    const sorted = [...(p.problems ?? [])].sort(
      (a, b) => Number(b.severity) - Number(a.severity) || Number(b.clock) - Number(a.clock),
    )
    const nowSec = Math.floor(Date.now() / 1000)
    return {
      groups: groups.map((x) => x.name),
      total: sorted.length,
      totalCapped: sorted.length >= FETCH_LIMIT,
      asOf: taipei(nowSec),
      returned: Math.min(limit, sorted.length),
      problems: sorted.slice(0, limit).map((x) => ({
        name: x.name,
        severity: SEVERITY[Number(x.severity)] ?? x.severity,
        since: taipei(Number(x.clock)),
        ageDays: Math.floor((nowSec - Number(x.clock)) / 86400),
        acknowledged: x.acknowledged === '1',
      })),
    }
  },
})