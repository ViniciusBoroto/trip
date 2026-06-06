import { sign, verify } from 'hono/jwt'

import { AuthConfigurationError, UnauthorizedError } from '../../domain/auth/errors'
import type { AccessTokenClaims, AuthSession, AuthUser } from '../../domain/auth/types'

type TokenServiceConfig = {
  accessSecret: string
  refreshPepper: string
  issuer: string
  audience: string
  accessTokenTtlSeconds: number
  refreshTokenTtlSeconds: number
  refreshTokenTtlRememberSeconds: number
}

const encoder = new TextEncoder()

export class JwtTokenService {
  constructor(private readonly config: TokenServiceConfig) {
    if (!config.accessSecret) {
      throw new AuthConfigurationError('JWT_ACCESS_SECRET binding is required.')
    }

    if (!config.refreshPepper) {
      throw new AuthConfigurationError('REFRESH_TOKEN_PEPPER binding is required.')
    }
  }

  now() {
    return new Date()
  }

  generateRefreshTokenId() {
    return crypto.randomUUID()
  }

  async issueSession(user: AuthUser, remember: boolean): Promise<AuthSession> {
    const issuedAt = Math.floor(this.now().getTime() / 1000)
    const accessExpiry = issuedAt + this.config.accessTokenTtlSeconds
    const refreshToken = generateOpaqueToken()
    const refreshTokenExpiresAt = new Date(
      (issuedAt + (remember ? this.config.refreshTokenTtlRememberSeconds : this.config.refreshTokenTtlSeconds)) * 1000,
    )

    const accessToken = await sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        type: 'access',
        iss: this.config.issuer,
        aud: this.config.audience,
        iat: issuedAt,
        exp: accessExpiry,
      },
      this.config.accessSecret,
    )

    return {
      accessToken,
      accessTokenExpiresAt: new Date(accessExpiry * 1000).toISOString(),
      refreshToken,
      refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
    }
  }

  async verifyAccessToken(token: string): Promise<AccessTokenClaims> {
    try {
      const payload = await verify(token, this.config.accessSecret, 'HS256')

      if (
        typeof payload.sub !== 'string' ||
        typeof payload.email !== 'string' ||
        typeof payload.name !== 'string' ||
        payload.type !== 'access' ||
        payload.iss !== this.config.issuer ||
        payload.aud !== this.config.audience ||
        typeof payload.exp !== 'number' ||
        typeof payload.iat !== 'number'
      ) {
        throw new UnauthorizedError('Access token payload is invalid.')
      }

      return payload as AccessTokenClaims
    } catch {
      throw new UnauthorizedError('Access token is invalid or expired.')
    }
  }

  async fingerprintToken(token: string): Promise<string> {
    const digest = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(`${token}.${this.config.refreshPepper}`),
    )

    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  }
}

function generateOpaqueToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(48))
  return toBase64Url(bytes)
}

function toBase64Url(bytes: Uint8Array) {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}
