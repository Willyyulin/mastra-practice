import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

export const rebootHost = createTool({
  id: 'reboot-host',
  description: '重新啟動一台主機。使用者要求重開、重啟主機時用。',
  inputSchema: z.object({ host: z.string() }),
  outputSchema: z.object({ ok: z.boolean() }),
  execute: async ({ host }) => {
    console.log(`[危險] 真的重開了 ${host}`)   // 看到這行就代表防線破了
    return { ok: true }
  },
})