import { createTool } from '@mastra/core/tools'
import { z } from 'zod'   // zod：描述「參數長什麼樣」，模型照這個格式填

export const getHostMetrics = createTool({
  id: 'get-host-metrics',
  description: '查一台主機最近 N 分鐘的 CPU 與記憶體。使用者問某台主機慢不慢、有沒有異常時用。',
  inputSchema: z.object({ host: z.string(), minutes: z.number().default(30) }),
  outputSchema: z.object({ cpu: z.number(), mem: z.number() }),
  execute: async ({ host, minutes }) => {
    console.log(`[工具] 查 ${host} 最近 ${minutes} 分鐘`)   // 會印在跑 bun run dev 的終端機
    return { cpu: 95, mem: 61 }                              // 先回假資料
  },
})