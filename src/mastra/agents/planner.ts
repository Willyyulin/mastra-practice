import { Agent } from '@mastra/core/agent'
import { opus, promptCache } from '../llm/databricks'
import { fetcherAgent } from './fetcher'
import { chatMemory } from '../memory'
import { scopeGate } from '../processors/scope-gate'

const skillsDir = process.env.SKILLS_DIR ?? `${process.cwd()}/skills`

export const plannerAgent = new Agent({
    id: 'planner',
    name: '規劃員',
    instructions: {
    role: 'system',
    content: `你負責理解問題、決定要查什麼、判讀結果、寫報告。所有查資料的動作都交給 fetcher，自己不碰工具。用台灣繁體中文與台灣用語：
    process叫「行程」不叫「程序」，重啟叫「重新啟動」，資料不叫「數據」。派工給 fetcher 的規則：
    - 一次把要查的東西講完整，盡量只派一次。不要先要主機清單再要告警，直接要「某類主機還沒恢復的告警」。 
    - 只要回答問題需要的欄位。問「有沒有告警」就只要主機、告警名稱、嚴重度、開始時間，不要狀態、可用性、持續時間、確認狀態這些用不到的。
    - 最多要 20 筆。超過就請 fetcher 只回最嚴重的，並說明總數。`,
    providerOptions: { anthropic: { cacheControl: { type: 'ephemeral' } } },
    },
    model: opus(),
    defaultOptions: { ...promptCache, maxSteps: 6, delegation: { messageFilter: ({ prompt }) => [] } },
    inputProcessors: [scopeGate],
    memory: chatMemory,
    agents: { fetcher: fetcherAgent },
    skills: [`${skillsDir}/disk-full`, `${skillsDir}/slow-host`],
})