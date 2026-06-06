import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { createAuthRoutes } from './api/routes/auth'
import { createRootRoutes } from './api/routes/root'
import { createTripRoutes } from './api/routes/trips'
import { getAuthService } from './di/auth'
import { getTripService } from './di/trip'
import type { AppBindings } from './di/bindings'

const app = new Hono<{ Bindings: AppBindings }>()

app.use('*', async (c, next) => {
  const requestOrigin = c.req.header('Origin') ?? ''
  const allowedOrigin = resolveAllowedOrigin(requestOrigin, c.env.APP_ORIGIN)

  return cors({
    origin: allowedOrigin,
    credentials: true,
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
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
