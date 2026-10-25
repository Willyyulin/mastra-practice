import { MCPClient } from '@mastra/mcp'

const url = process.env.MCP_GATEWAY_URL
if (!url) throw new Error('缺少環境變數 MCP_GATEWAY_URL')

export const gatewayMcp = new MCPClient({
  id: 'gateway',
  servers: { gw: { url: new URL(url) } },
})

// 白名單：gateway 後面有 28 個 server、400 多個工具，只放這幾個 server 給模型看
const ALLOW_SERVERS = ['zabbix-mcp-server']

export async function gatewayTools() {
  const all = await gatewayMcp.listTools()
  const allowed = Object.entries(all).filter(([name]) =>
    ALLOW_SERVERS.some((server) => name.startsWith(`gw_${server}__`)),
  )
  return Object.fromEntries(allowed)
}