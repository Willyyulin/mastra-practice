import { MCPClient } from '@mastra/mcp'

const dir = process.env.SKILLS_DIR
if (!dir) throw new Error('缺少環境變數 SKILLS_DIR')

export const fsMcp = new MCPClient({
  id: 'fs',
  servers: {
    fs: {
      command: 'bunx',
      args: ['-y', '@modelcontextprotocol/server-filesystem@2.0.0', dir],
    },
  },
})