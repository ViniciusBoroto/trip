import { Hono } from 'hono'
import type { Context } from 'hono'

import type { AuthService } from '../application/auth/auth-service'
import {
  AuthConfigurationError,
  InactiveUserError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  UnauthorizedError,
} from '../domain/auth/errors'
import type { AppBindings } from '../infra/db/client'
import { clearRefreshToken, readRefreshToken, writeRefreshToken } from './cookies'
import { createAuthMiddleware, type AuthenticatedAppEnv } from './middleware'

type LoginBody = {
  email?: unknown
  password?: unknown
  remember?: unknown
}

export function createAuthRouter(getAuthService: (bindings: AppBindings) => AuthService) {
  const auth = new Hono<AuthenticatedAppEnv>()

  auth.post('/login', async (c) => {
    const body = (await c.req.json().catch(() => null)) as LoginBody | null
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const password = typeof body?.password === 'string' ? body.password : ''
    const remember = body?.remember === true

    if (!email || !password) {
      return c.json({ ok: false, message: 'Email and password are required.' }, 400)
    }

    try {
      const session = await getAuthService(c.env).login(email, password, remember)
      writeRefreshToken(c, session.refreshToken, session.refreshTokenExpiresAt)

      return c.json({
        ok: true,
        message: 'Authenticated.',
        user: session.user,
        accessToken: session.accessToken,
        accessTokenExpiresAt: session.accessTokenExpiresAt,
      })
    } catch (error) {
      return handleAuthError(c, error)
    }
  })

  auth.post('/refresh', async (c) => {
    const refreshToken = readRefreshToken(c)

    if (!refreshToken) {
      return c.json({ ok: false, message: 'Refresh token cookie is missing.' }, 401)
    }

    try {
      const session = await getAuthService(c.env).refresh(refreshToken)
      writeRefreshToken(c, session.refreshToken, session.refreshTokenExpiresAt)

      return c.json({
        ok: true,
        message: 'Session refreshed.',
        user: session.user,
        accessToken: session.accessToken,
        accessTokenExpiresAt: session.accessTokenExpiresAt,
      })
    } catch (error) {
      clearRefreshToken(c)
      return handleAuthError(c, error)
    }
  })

  auth.post('/logout', async (c) => {
    try {
      await getAuthService(c.env).logout(readRefreshToken(c))
      clearRefreshToken(c)

      return c.json({ ok: true, message: 'Logged out.' })
    } catch (error) {
      clearRefreshToken(c)
      return handleAuthError(c, error)
    }
  })

  auth.use('/me', createAuthMiddleware(getAuthService))
  auth.get('/me', async (c) => {
    try {
      const claims = c.get('auth')
      const user = await getAuthService(c.env).getAuthenticatedUser(claims.sub)

      return c.json({ ok: true, user })
    } catch (error) {
      return handleAuthError(c, error)
    }
  })

  return auth
}

function handleAuthError<E extends { Bindings: AppBindings }>(c: Context<E>, error: unknown) {
  if (error instanceof InvalidCredentialsError) {
    return c.json({ ok: false, message: error.message }, 401)
  }

  if (error instanceof InvalidRefreshTokenError || error instanceof UnauthorizedError) {
    return c.json({ ok: false, message: error.message }, 401)
  }

  if (error instanceof InactiveUserError) {
    return c.json({ ok: false, message: error.message }, 403)
  }

  if (error instanceof AuthConfigurationError) {
    return c.json({ ok: false, message: error.message }, 500)
  }

  console.error(error)
  return c.json({ ok: false, message: 'Authentication flow failed.' }, 500)
}
