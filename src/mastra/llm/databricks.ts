
// 接 Databricks AI Gateway 的 Anthropic 原生 API（第 3 課的第 3 種寫法，PAT 版）
  import { createAnthropic } from '@ai-sdk/anthropic'
  import type { AgentExecutionOptions } from '@mastra/core/agent'

  function requireEnv(name: string): string {
    const value = process.env[name]
    if (!value) throw new Error(`缺少環境變數 ${name}，請檢查 .env`)
    return value
  }

  const host = requireEnv('DATABRICKS_HOST')
  const token = requireEnv('DATABRICKS_AI_GATEWAY_TOKEN')

  // gateway 收的是原生 Anthropic 請求，認證用 Bearer token
  const anthropic = createAnthropic({
    baseURL: `${host}/ai-gateway/anthropic/v1`,
    authToken: token,
  })

  export const promptCache = {
  providerOptions: { anthropic: { cacheControl: { type: 'ephemeral' } } },
} satisfies AgentExecutionOptions
  export const sonnet = () => anthropic(requireEnv('DATABRICKS_MODEL_SONNET'))
  export const opus = () => anthropic(requireEnv('DATABRICKS_MODEL_OPUS'))