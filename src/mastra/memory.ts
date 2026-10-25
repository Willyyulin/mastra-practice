import { Memory } from '@mastra/memory'
import { z } from 'zod'
import { storage } from './storage'

export const chatMemory = new Memory({
  storage,
  options: {
    lastMessages: 20,
    workingMemory: {
      enabled: true,
      scope: 'resource',   // 跟著「這是誰」走，跨 thread 都記得
      schema: z.object({
        ownedHosts: z.array(z.string()).describe('這個人負責的主機'),
        knownNormal: z.array(z.string()).describe('已知是正常的現象，不用處理'),
      }),
    },
  },
})

// fetcher 自己的空記憶：不帶歷史、不開 working memory，只是為了不繼承 planner 的
export const noMemory = new Memory({
  storage,
  options: { lastMessages: false, workingMemory: { enabled: false } },
})
