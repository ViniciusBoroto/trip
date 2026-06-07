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

export type CreateOtpInput = {
  id: string
  email: string
  codeHash: string
  expiresAt: string
  createdAt: string
}

export type OtpRecord = {
  id: string
  email: string
  codeHash: string
  expiresAt: string
  usedAt: string | null
  createdAt: string
}

export interface UserRepository {
  findByEmail(email: string): Promise<AuthUser | null>
  findById(id: string): Promise<AuthUser | null>
  create(input: {
    id: string
    email: string
    name: string
    passwordHash: string | null
    isActive: boolean
    createdAt: string
  }): Promise<AuthUser>
}

export interface RefreshTokenRepository {
  create(input: CreateRefreshTokenInput): Promise<void>
  findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null>
  revoke(tokenId: string, revokedAt: string, replacedByTokenId?: string): Promise<void>
  touch(tokenId: string, usedAt: string): Promise<void>
}

export interface PasswordHasher {
  hash(password: string): Promise<string>
  verify(password: string, passwordHash: string): Promise<boolean>
}

export interface TokenService {
  issueSession(user: AuthUser, remember: boolean): Promise<AuthSession>
  verifyAccessToken(token: string): Promise<AccessTokenClaims>
  fingerprintToken(token: string): Promise<string>
  generateRefreshTokenId(): string
  now(): Date
}

export interface OtpRepository {
  create(input: CreateOtpInput): Promise<void>
  findActiveByEmail(email: string, now: Date): Promise<OtpRecord | null>
  markUsed(id: string, usedAt: string): Promise<void>
  revokeByEmail(email: string, usedAt: string): Promise<void>
}

export interface EmailSender {
  sendOtp(email: string, code: string): Promise<void>
}
