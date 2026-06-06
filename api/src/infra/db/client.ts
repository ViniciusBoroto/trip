import { drizzle } from 'drizzle-orm/d1'

import * as schema from './schema'

export type DbBinding = Parameters<typeof drizzle>[0]
export type DbClient = ReturnType<typeof getDb>

export interface AppBindings {
  DB: DbBinding
  JWT_ACCESS_SECRET: string
  REFRESH_TOKEN_PEPPER: string
  JWT_ISSUER?: string
  JWT_AUDIENCE?: string
  APP_ORIGIN?: string
}

export const getDb = (binding: DbBinding) => drizzle(binding, { schema })
