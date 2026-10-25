import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

export const now = createTool({
  id: 'now',
  description: '回傳現在的時間：Unix 秒數與台灣時間字串。遇到「最近 N 分鐘」「今天」「多久以前」這類問題，先叫這個，再算 time_from 或持續時間。',
  inputSchema: z.object({}),
  outputSchema: z.object({ unix: z.number(), taipei: z.string() }),
  execute: async () => {
    const d = new Date()
    return {
      unix: Math.floor(d.getTime() / 1000),
      taipei: d.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false }),
    }
  },
})