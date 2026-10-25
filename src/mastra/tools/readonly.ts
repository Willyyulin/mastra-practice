import { createTool, type ToolAction } from '@mastra/core/tools'

// 名稱符合任何一條就視為「會寫入」
const DENY = [/reboot/, /restart/, /delete/, /write/, /update/, /execute_sql/, /create/, /move/, /edit/]
export const denied = (name: string) => DENY.some(re => re.test(name))

type AnyTool = ToolAction<any, any, any, any, any>

// hide = true：拒絕清單裡的工具不給模型看（第 2 層）
// 不管 hide 是什麼，execute 都會再擋一次（第 3 層）
export function readOnly(tools: Record<string, AnyTool>, { hide = true } = {}): Record<string, AnyTool> {
  const out: Record<string, AnyTool> = {}
  for (const [name, tool] of Object.entries(tools)) {
    if (hide && (denied(name) || denied(tool.id))) continue
    out[name] = createTool({
      id: tool.id,
      description: tool.description,
      inputSchema: tool.inputSchema,
      outputSchema: tool.outputSchema,
      execute: async (input: unknown, ctx: any) => {
        if (denied(tool.id)) throw new Error('此工具已停用')
        return tool.execute!(input, ctx)
      },
    })
  }
  return out
}