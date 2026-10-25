import { createTool, type ToolAction } from '@mastra/core/tools'

// 工具結果超過這個字數就截斷，避免一筆大 JSON 之後每一步都重送進模型
const MAX_CHARS = 8_000

type AnyTool = ToolAction<any, any, any, any, any>

function capOne(tool: AnyTool, max: number): AnyTool {
  return createTool({
    id: tool.id,
    description: tool.description,
    inputSchema: tool.inputSchema,
    // 故意不帶 outputSchema：截斷後的形狀跟原本不一樣
    execute: async (input: unknown, ctx: any) => {
      const result = await tool.execute!(input, ctx)
      const text = typeof result === 'string' ? result : JSON.stringify(result)
      if (text.length <= max) return result
      return {
        truncated: true,
        totalChars: text.length,
        note: `結果太大（${text.length} 字），只保留前 ${max} 字。請加 limit 或只要需要的欄位，再查一次。`,
        head: text.slice(0, max),
      }
    },
  })
}

export function capOutput(tools: Record<string, AnyTool>, max = MAX_CHARS): Record<string, AnyTool> {
  return Object.fromEntries(Object.entries(tools).map(([name, tool]) => [name, capOne(tool, max)]))
}