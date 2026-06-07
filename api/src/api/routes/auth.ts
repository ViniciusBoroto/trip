import { Hono } from 'hono'
import type { Context } from 'hono'

import type { AuthService } from '../../application/auth/auth-service'
import type { AppBindings } from '../../di/bindings'
import {
  AuthConfigurationError,
  EmailAlreadyTakenError,
  InactiveUserError,
  InvalidAuthInputError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  OtpExpiredOrUsedError,
  OtpNotFoundError,
  UnauthorizedError,
} from '../../domain/auth/errors'
import { clearRefreshToken, readRefreshToken, writeRefreshToken } from '../cookies'
import { createAuthMiddleware, type AuthenticatedAppEnv } from '../middleware'

export function createAuthRoutes(getAuthService: (bindings: AppBindings) => AuthService) {
  const auth = new Hono<AuthenticatedAppEnv>()

  auth.post('/register', async (c) => {
    const body = await c.req.json().catch(() => null)

    try {
      const session = await getAuthService(c.env).register(body)
      writeRefreshToken(c, session.refreshToken, session.refreshTokenExpiresAt)

      return c.json(
        {
          ok: true,
          message: 'Account created.',
          user: session.user,
          accessToken: session.accessToken,
          accessTokenExpiresAt: session.accessTokenExpiresAt,
        },
        201,
      )
    } catch (error) {
      return handleAuthError(c, error)
    }
  })

  auth.post('/login', async (c) => {
    const body = await c.req.json().catch(() => null)

    try {
      const session = await getAuthService(c.env).login(body)
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

  auth.post('/otp/send', async (c) => {
    const body = await c.req.json().catch(() => null)

    try {
      await getAuthService(c.env).sendOtp(body)
      return c.json({ ok: true, message: 'Code sent. Check your email.' })
    } catch (error) {
      return handleAuthError(c, error)
    }
  })

  auth.post('/otp/verify', async (c) => {
    const body = await c.req.json().catch(() => null)

    try {
      const session = await getAuthService(c.env).verifyOtp(body)
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

  return auth
}

function handleAuthError<E extends { Bindings: AppBindings }>(c: Context<E>, error: unknown) {
  if (error instanceof InvalidAuthInputError) {
    return c.json({ ok: false, message: error.message }, 400)
  }

  if (error instanceof EmailAlreadyTakenError) {
    return c.json({ ok: false, message: error.message }, 409)
  }

  if (error instanceof InvalidCredentialsError) {
    return c.json({ ok: false, message: error.message }, 401)
  }

  if (error instanceof InvalidRefreshTokenError || error instanceof UnauthorizedError) {
    return c.json({ ok: false, message: error.message }, 401)
  }

  if (error instanceof InactiveUserError) {
    return c.json({ ok: false, message: error.message }, 403)
  }

  if (error instanceof OtpNotFoundError) {
    return c.json({ ok: false, message: error.message }, 401)
  }

  if (error instanceof OtpExpiredOrUsedError) {
    return c.json({ ok: false, message: error.message }, 401)
  }

  if (error instanceof AuthConfigurationError) {
    return c.json({ ok: false, message: error.message }, 500)
  }

  console.error(error)
  return c.json({ ok: false, message: 'Authentication flow failed.' }, 500)
}
