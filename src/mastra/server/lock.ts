import type { Context, Next } from 'hono'

const OPEN_PATHS = ['/ask', '/health']

export const lockMiddleware = {
  path: '/*',
  handler: async (c: Context, next: Next) => {
    if (process.env.LOCK_API !== '1' || OPEN_PATHS.includes(c.req.path)) {
      return next()
    }
    return c.json({ error: '這個路徑沒有對外開放' }, 403)
  },
}