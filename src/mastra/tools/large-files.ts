import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

export const listLargeFiles = createTool({
  id: 'list-large-files',
  description: '列出一台主機上最大的 N 個檔案。查磁碟空間被誰吃掉時用。',
  inputSchema: z.object({ host: z.string(), top: z.number().default(10) }),
  outputSchema: z.object({ files: z.array(z.object({ path: z.string(), gb: z.number() })) }),
  execute: async ({ host, top }) => {
    console.log(`[工具] 列 ${host} 前 ${top} 大檔案`)
    return { files: [{ path: '/var/log/nginx/access.log', gb: 42 }, { path: '/var/lib/docker', gb: 18 }] }
  },
})