import { registerApiRoute } from '@mastra/core/server'

export const askRoute = registerApiRoute('/ask', {
  method: 'POST',
  handler: async (c) => {
    const body = await c.req.json().catch(() => null)
    const question = typeof body?.question === 'string' ? body.question.trim() : ''
    const user = typeof body?.user === 'string' ? body.user : ''
    const thread = typeof body?.thread === 'string' ? body.thread : ''
    if (!question || !user || !thread) {
      return c.json({ error: 'question、user、thread 都要有' }, 400)
    }
    const agent = c.get('mastra').getAgent('plannerAgent')
    const result = await agent.generate(question, {
      memory: { resource: `user:${user}`, thread: `slack:${thread}` },
    })
    return c.json({ text: result.text, blocked: result.tripwire?.reason ?? null, traceId: result.traceId })
  },
})