import { AuthService } from '../application/auth/auth-service'
import { Pbkdf2PasswordHasher } from '../infra/auth/password-hasher'
import { JwtTokenService } from '../infra/auth/token-service'
import { getDb } from '../infra/db/client'
import { D1RefreshTokenRepository } from '../infra/repositories/refresh-token-repository'
import { D1UserRepository } from '../infra/repositories/user-repository'
import type { AppBindings } from './bindings'

export function getAuthService(bindings: AppBindings) {
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
