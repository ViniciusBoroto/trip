import type { AccessTokenClaims, AuthSession, AuthUser } from '../../domain/auth/types'
import type { RefreshTokenRecord } from '../../domain/auth/types'

export type CreateRefreshTokenInput = {
  id: string
  userId: string
  tokenHash: string
  expiresAt: string
  createdAt: string
  remember: boolean
}

export interface UserRepository {
  findByEmail(email: string): Promise<AuthUser | null>
  findById(id: string): Promise<AuthUser | null>
}

export interface RefreshTokenRepository {
  create(input: CreateRefreshTokenInput): Promise<void>
  findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null>
  revoke(tokenId: string, revokedAt: string, replacedByTokenId?: string): Promise<void>
  touch(tokenId: string, usedAt: string): Promise<void>
}

export interface PasswordHasher {
  verify(password: string, passwordHash: string): Promise<boolean>
}

export interface TokenService {
  issueSession(user: AuthUser, remember: boolean): Promise<AuthSession>
  verifyAccessToken(token: string): Promise<AccessTokenClaims>
  fingerprintToken(token: string): Promise<string>
  generateRefreshTokenId(): string
  now(): Date
}
