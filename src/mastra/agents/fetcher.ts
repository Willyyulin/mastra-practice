import { Agent } from '@mastra/core/agent'
import { sonnet,promptCache } from '../llm/databricks'
import { getHostMetrics } from '../tools/host-metrics'
import { listLargeFiles } from '../tools/large-files'
import { rebootHost } from '../tools/reboot-host'
import { readOnly } from '../tools/readonly'
import { noMemory } from '../memory'
import { fsMcp } from '../mcp/filesystem'
import { gatewayTools } from '../mcp/gateway'
import { capOutput } from '../tools/cap-output'
import { now } from '../tools/now'
export const fetcherAgent = new Agent({
  id: 'fetcher',
  name: '查資料員',
  description: '照指示呼叫工具查主機資料（CPU、記憶體、大檔案）、查 Zabbix 監控（主機、告警、歷史數值），也能讀 SOP 資料夾裡的檔案內容、大小、修改時間；回傳原始數字與查詢條件，不判讀、不建議。',
  instructions: `你只負責呼叫工具把資料查回來。回傳查到的數字與查詢條件，不要判讀，不要給建議。用台灣繁體中文。
                查 Zabbix 的規則：
                - output 一律 "extend"，這個工具不吃欄位清單，給了只會回 ID。筆數用 limit 控制：problem 一次最多 20，host 一次最多 8。
                - 問某一類主機（WAF、DB…）的告警：先 hostgroup_get 用 search 找群組拿 groupids，再 problem_get 帶 groupids、severities、limit。不要先 host_get 再一台一台查。
                - problem_get 預設只回還沒恢復的（r_eventid 是 "0"），name 裡通常已有主機名與 IP，不用再查 trigger。severity 4 是 High、5 是 Disaster。
                - 「最近 N 分鐘」先叫 now 拿 unix 秒數，time_from = unix - N*60。
                - 工具回傳 truncated: true 表示結果太大，縮小 limit 或加 severities 再查一次。
                - 查不到或工具失敗就照實回報，不要改用其他工具猜。
                回報格式：
                - 最多 20 行，一筆一行：主機、名稱、嚴重度、開始時間。不要重複工具回傳的其他欄位。
                - 超過 20 筆只回最嚴重的 20 筆，第一行寫總筆數。
                - 不要寫前言、結語、分析。`,
  model: sonnet(),
  tools: capOutput(readOnly({ now, getHostMetrics, listLargeFiles, rebootHost, ...(await fsMcp.listTools()), ...(await gatewayTools()) })),
  memory: noMemory,
  defaultOptions: { ...promptCache, maxSteps: 8 }
})