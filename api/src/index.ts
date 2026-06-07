import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { createAuthRoutes } from './api/routes/auth'
import { createRootRoutes } from './api/routes/root'
import { createTripRoutes } from './api/routes/trips'
import { UnauthorizedError } from './domain/auth/errors'
import { getAuthService } from './di/auth'
import { getTripService } from './di/trip'
import type { AppBindings } from './di/bindings'

const app = new Hono<{ Bindings: AppBindings }>()

app.onError((error, c) => {
  if (error instanceof UnauthorizedError) {
    return c.json({ ok: false, message: error.message }, 401)
  }

  console.error(error)
  return c.json({ ok: false, message: 'Internal server error.' }, 500)
})

app.use('*', async (c, next) => {
  const requestOrigin = c.req.header('Origin') ?? ''
  const allowedOrigin = resolveAllowedOrigin(requestOrigin, c.env.APP_ORIGIN)

  return cors({
    origin: allowedOrigin,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })(c, next)
})

app.route('/', createRootRoutes())
app.route('/auth', createAuthRoutes(getAuthService))
app.route('/trips', createTripRoutes(getTripService, getAuthService))


export default app

function resolveAllowedOrigin(requestOrigin: string, configuredOrigin?: string) {
  if (configuredOrigin) {
    return configuredOrigin
  }

  return requestOrigin || '*'
}
