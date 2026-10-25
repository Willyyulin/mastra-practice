import { LibSQLStore } from '@mastra/libsql'

const dbUrl = process.env.MASTRA_DB_URL ?? `file:${process.cwd()}/data/mastra.db`
export const storage = new LibSQLStore({ id: 'practice', url: dbUrl })