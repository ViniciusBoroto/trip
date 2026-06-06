import type { MiddlewareHandler } from 'hono'

import type { AuthService } from '../application/auth/auth-service'
import { UnauthorizedError } from '../domain/auth/errors'
import type { AccessTokenClaims } from '../domain/auth/types'
import type { AppBindings } from '../di/bindings'

type AuthVariables = {
  auth: AccessTokenClaims
}

export type AuthenticatedAppEnv = {
  Bindings: AppBindings
  Variables: AuthVariables
}

export function createAuthMiddleware(getAuthService: (bindings: AppBindings) => AuthService): MiddlewareHandler<AuthenticatedAppEnv> {
  return async (c, next) => {
    const authorization = c.req.header('Authorization')

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Bearer access token is required.')
    }

    const token = authorization.slice('Bearer '.length).trim()

    if (!token) {
      throw new UnauthorizedError('Bearer access token is required.')
    }

    const claims = await getAuthService(c.env).authenticateAccessToken(token)
    c.set('auth', claims)

    await next()
  }
}
