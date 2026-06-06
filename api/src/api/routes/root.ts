import { sql } from 'drizzle-orm'
import { Hono } from 'hono'

import type { AppBindings } from '../../di/bindings'
import { getDb } from '../../infra/db/client'

export function createRootRoutes() {
  const router = new Hono<{ Bindings: AppBindings }>()

  router.get('/', async (c) => {
    const db = getDb(c.env.DB)
    const result = await db.get<{ ok: number }>(sql`select 1 as ok`)

    return c.json({
      ok: result?.ok === 1,
      driver: 'drizzle',
    })
  })

  return router
}
