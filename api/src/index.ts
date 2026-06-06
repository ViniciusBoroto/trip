import { sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { AuthService } from './application/auth/auth-service'
import { D1RefreshTokenRepository } from './infra/repositories/refresh-token-repository'
import { Pbkdf2PasswordHasher } from './infra/auth/password-hasher'
import { JwtTokenService } from './infra/auth/token-service'
import { D1UserRepository } from './infra/repositories/user-repository'
import { getDb, type AppBindings } from './infra/db/client'
import { createAuthRouter } from './api/router'

const app = new Hono<{ Bindings: AppBindings }>()

app.use('*', async (c, next) => {
  const requestOrigin = c.req.header('Origin') ?? ''
  const allowedOrigin = resolveAllowedOrigin(requestOrigin, c.env.APP_ORIGIN)

  return cors({
    origin: allowedOrigin,
    credentials: true,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })(c, next)
})

app.get('/', async (c) => {
  const db = getDb(c.env.DB)
  const result = await db.get<{ ok: number }>(sql`select 1 as ok`)

  return c.json({
    ok: result?.ok === 1,
    driver: 'drizzle',
  })
})

app.route('/auth', createAuthRouter(getAuthService))

export default app

function getAuthService(bindings: AppBindings) {
  const db = getDb(bindings.DB)

  return new AuthService({
    users: new D1UserRepository(db),
    refreshTokens: new D1RefreshTokenRepository(db),
    passwordHasher: new Pbkdf2PasswordHasher(),
    tokenService: new JwtTokenService({
      accessSecret: bindings.JWT_ACCESS_SECRET,
      refreshPepper: bindings.REFRESH_TOKEN_PEPPER,
      issuer: bindings.JWT_ISSUER ?? 'trip-api',
      audience: bindings.JWT_AUDIENCE ?? 'trip-app',
      accessTokenTtlSeconds: 15 * 60,
      refreshTokenTtlSeconds: 7 * 24 * 60 * 60,
      refreshTokenTtlRememberSeconds: 30 * 24 * 60 * 60,
    }),
  })
}

function resolveAllowedOrigin(requestOrigin: string, configuredOrigin?: string) {
  if (configuredOrigin) {
    return configuredOrigin
  }

  return requestOrigin || '*'
}
