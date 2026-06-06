import { sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { getDb, type AppBindings } from './infra/db/client'

type LoginBody = {
  email?: unknown
  password?: unknown
  remember?: unknown
}

const app = new Hono<{ Bindings: AppBindings }>()

app.use(
  '/auth/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  }),
)

app.get('/', async (c) => {
  const db = getDb(c.env.DB)
  const result = await db.get<{ ok: number }>(sql`select 1 as ok`)

  return c.json({
    ok: result?.ok === 1,
    driver: 'drizzle',
  })
})

app.get('/auth/session', (c) => {
  return c.json({
    authenticated: false,
    user: null,
    message: 'Session route placeholder. Wire auth state here.',
  })
})

app.post('/auth/login', async (c) => {
  const body = (await c.req.json().catch(() => null)) as LoginBody | null

  return c.json(
    {
      ok: false,
      message: 'Login route created, backend auth logic not implemented.',
      received: {
        email: typeof body?.email === 'string' ? body.email : null,
        hasPassword: typeof body?.password === 'string' && body.password.length > 0,
        remember: typeof body?.remember === 'boolean' ? body.remember : null,
      },
    },
    501,
  )
})

app.post('/auth/logout', (c) => {
  return c.json(
    {
      ok: false,
      message: 'Logout route created, backend auth logic not implemented.',
    },
    501,
  )
})

export default app
