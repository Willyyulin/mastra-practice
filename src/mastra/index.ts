import { Mastra } from '@mastra/core'
import { Observability, MastraStorageExporter } from '@mastra/observability'
import { opsAgent } from './agents/ops'
import { plannerAgent } from './agents/planner'
import { fetcherAgent } from './agents/fetcher'
import { storage } from './storage'
import { askRoute } from './server/ask-route'
import { lockMiddleware } from './server/lock'
import { hostCheck } from './workflows/host-check'
import { fleetCheck } from './workflows/fleet-check'

export const mastra = new Mastra({
  agents: { opsAgent, plannerAgent, fetcherAgent },
  server: { apiRoutes: [askRoute], middleware: [lockMiddleware] },
  storage,   // 連線在 storage.ts 建，trace 和記憶共用這一個
  workflows: { hostCheck, fleetCheck },
  observability: new Observability({
    configs: { local: { serviceName: 'mastra-practice', exporters: [new MastraStorageExporter()] } },
  }),
})