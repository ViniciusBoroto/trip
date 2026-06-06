import { drizzle } from 'drizzle-orm/d1'

import * as schema from './schema'

export type DbBinding = Parameters<typeof drizzle>[0]
export type DbClient = ReturnType<typeof getDb>

export const getDb = (binding: DbBinding) => drizzle(binding, { schema })
