import { drizzle } from 'drizzle-orm/d1'

export type DbBinding = Parameters<typeof drizzle>[0]

export interface AppBindings {
  DB: DbBinding
}

export const getDb = (binding: DbBinding) => drizzle(binding)
