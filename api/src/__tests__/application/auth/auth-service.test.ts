import { describe, it, expect, mock, beforeEach } from 'bun:test'

import { AuthService } from '../../../application/auth/auth-service'
import type { EmailSender, OtpRepository, PasswordHasher, RefreshTokenRepository, TokenService, UserRepository } from '../../../application/auth/ports'
import {
  EmailAlreadyTakenError,
  InactiveUserError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
} from '../../../domain/auth/errors'
import type { AccessTokenClaims, AuthSession, AuthUser, PublicAuthUser, RefreshTokenRecord } from '../../../domain/auth/types'

const now = new Date('2025-01-01T00:00:00.000Z')

const defaultUser: AuthUser = {
  id: 'user-abc',
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: 'hashed-password',
  isActive: true,
}

const defaultSession: AuthSession = {
  accessToken: 'access-token-123',
  accessTokenExpiresAt: new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
  refreshToken: 'refresh-token-abc',
  refreshTokenExpiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
}

function makeMocks(overrides: Partial<{
  user: AuthUser | null
  session: AuthSession
  refreshTokenRecord: RefreshTokenRecord | null
  hashResult: string
  verifyResult: boolean
}> = {}) {
  const mockUsers: UserRepository = {
    findByEmail: mock(() => Promise.resolve(overrides.user ?? null)),
    findById: mock(() => Promise.resolve(overrides.user ?? null)),
    create: mock(() => Promise.resolve(overrides.user ?? defaultUser)),
  }

  const mockRefreshTokens: RefreshTokenRepository = {
    create: mock(() => Promise.resolve()),
    findByTokenHash: mock(() => Promise.resolve(overrides.refreshTokenRecord ?? null)),
    revoke: mock(() => Promise.resolve()),
    touch: mock(() => Promise.resolve()),
  }

  const mockPasswordHasher: PasswordHasher = {
    hash: mock(() => Promise.resolve(overrides.hashResult ?? 'new-hash')),
    verify: mock(() => Promise.resolve(overrides.verifyResult ?? true)),
  }

  const mockTokenService: TokenService = {
    issueSession: mock(() => Promise.resolve(overrides.session ?? defaultSession)),
    verifyAccessToken: mock(() => Promise.resolve({
      sub: 'user-abc',
      email: 'test@example.com',
      name: 'Test User',
      type: 'access',
      iss: 'test-issuer',
      aud: 'test-audience',
      exp: Math.floor(now.getTime() / 1000) + 900,
      iat: Math.floor(now.getTime() / 1000),
    })),
    fingerprintToken: mock(() => Promise.resolve('fingerprinted-hash')),
    generateRefreshTokenId: mock(() => 'new-token-id'),
    now: mock(() => now),
  }

  const mockOtps: OtpRepository = {
    create: mock(() => Promise.resolve()),
    findActiveByEmail: mock(() => Promise.resolve(null)),
    markUsed: mock(() => Promise.resolve()),
    revokeByEmail: mock(() => Promise.resolve()),
  }

  const mockEmailSender: EmailSender = {
    sendOtp: mock(() => Promise.resolve()),
  }

  return { mockUsers, mockRefreshTokens, mockPasswordHasher, mockTokenService, mockOtps, mockEmailSender }
}

function createService(mocks: ReturnType<typeof makeMocks>) {
  return new AuthService({
    users: mocks.mockUsers,
    refreshTokens: mocks.mockRefreshTokens,
    passwordHasher: mocks.mockPasswordHasher,
    tokenService: mocks.mockTokenService,
    otps: mocks.mockOtps,
    emailSender: mocks.mockEmailSender,
  })
}

describe('AuthService', () => {
  describe('register', () => {
    it('creates a user and returns a session with public user', async () => {
      const mocks = makeMocks({ user: null })
      const service = createService(mocks)

      const result = await service.register({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      })

      expect(mocks.mockPasswordHasher.hash).toHaveBeenCalledWith('password123')
      expect(mocks.mockUsers.create).toHaveBeenCalled()
      expect(mocks.mockUsers.create.mock.calls[0][0].email).toBe('new@example.com')
      expect(mocks.mockUsers.create.mock.calls[0][0].name).toBe('New User')
      expect(mocks.mockTokenService.issueSession).toHaveBeenCalled()
      expect(mocks.mockRefreshTokens.create).toHaveBeenCalled()

      expect(result.user).toEqual({ id: 'user-abc', email: 'test@example.com', name: 'Test User' })
      expect(result.accessToken).toBe('access-token-123')
      expect(result.refreshToken).toBe('refresh-token-abc')
    })

    it('throws EmailAlreadyTakenError when email exists', async () => {
      const mocks = makeMocks({ user: defaultUser })
      const service = createService(mocks)

      await expect(
        service.register({ name: 'User', email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow(EmailAlreadyTakenError)

      expect(mocks.mockPasswordHasher.hash).not.toHaveBeenCalled()
      expect(mocks.mockUsers.create).not.toHaveBeenCalled()
    })

    it('throws EmailAlreadyTakenError on DB unique constraint violation', async () => {
      const mocks = makeMocks({ user: null })
      mocks.mockUsers.create = mock(() => {
        throw new Error('UNIQUE constraint failed: users.email')
      })
      const service = createService(mocks)

      await expect(
        service.register({ name: 'User', email: 'taken@example.com', password: 'password123' }),
      ).rejects.toThrow(EmailAlreadyTakenError)
    })

    it('re-throws non-unique errors from create', async () => {
      const mocks = makeMocks({ user: null })
      const dbError = new Error('DB connection lost')
      mocks.mockUsers.create = mock(() => { throw dbError })
      const service = createService(mocks)

      await expect(
        service.register({ name: 'User', email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow(dbError)
    })

    it('throws InvalidAuthInputError for bad input', async () => {
      const mocks = makeMocks({ user: null })
      const service = createService(mocks)

      await expect(service.register({})).rejects.toThrow('Name, email, and password are required.')
    })
  })

  describe('login', () => {
    it('returns session for valid credentials', async () => {
      const mocks = makeMocks({ user: defaultUser })
      const service = createService(mocks)

      const result = await service.login({ email: 'test@example.com', password: 'correct-password' })

      expect(mocks.mockUsers.findByEmail).toHaveBeenCalledWith('test@example.com')
      expect(mocks.mockPasswordHasher.verify).toHaveBeenCalledWith('correct-password', 'hashed-password')
      expect(mocks.mockTokenService.issueSession).toHaveBeenCalled()
      expect(result.accessToken).toBe('access-token-123')
      expect(result.refreshToken).toBe('refresh-token-abc')
    })

    it('throws InvalidCredentialsError when user not found', async () => {
      const mocks = makeMocks({ user: null })
      const service = createService(mocks)

      await expect(
        service.login({ email: 'unknown@example.com', password: 'password' }),
      ).rejects.toThrow(InvalidCredentialsError)

      expect(mocks.mockPasswordHasher.verify).not.toHaveBeenCalled()
    })

    it('throws InvalidCredentialsError when password does not match', async () => {
      const mocks = makeMocks({ user: defaultUser, verifyResult: false })
      const service = createService(mocks)

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(InvalidCredentialsError)
    })

    it('throws InactiveUserError when user is inactive', async () => {
      const mocks = makeMocks({ user: { ...defaultUser, isActive: false } })
      const service = createService(mocks)

      await expect(
        service.login({ email: 'test@example.com', password: 'password' }),
      ).rejects.toThrow(InactiveUserError)

      expect(mocks.mockPasswordHasher.verify).not.toHaveBeenCalled()
    })

    it('throws InvalidAuthInputError for bad input', async () => {
      const mocks = makeMocks()
      const service = createService(mocks)

      await expect(service.login({})).rejects.toThrow('Email and password are required.')
    })
  })

  describe('refresh', () => {
    const validRecord: RefreshTokenRecord = {
      id: 'token-id-1',
      userId: 'user-abc',
      tokenHash: 'fingerprinted-hash',
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      revokedAt: null,
      replacedByTokenId: null,
      lastUsedAt: null,
      remember: false,
    }

    it('rotates the token and returns new session', async () => {
      const nextSession: AuthSession = {
        accessToken: 'new-access-token',
        accessTokenExpiresAt: new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
        refreshToken: 'new-refresh-token',
        refreshTokenExpiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }

      const mocks = makeMocks({ user: defaultUser, refreshTokenRecord: validRecord, session: nextSession })
      const service = createService(mocks)

      const result = await service.refresh('old-refresh-token')

      expect(mocks.mockTokenService.fingerprintToken).toHaveBeenCalledWith('old-refresh-token')
      expect(mocks.mockRefreshTokens.findByTokenHash).toHaveBeenCalledWith('fingerprinted-hash')
      expect(mocks.mockTokenService.issueSession).toHaveBeenCalledWith(defaultUser, false)
      expect(mocks.mockRefreshTokens.create).toHaveBeenCalled()
      expect(mocks.mockRefreshTokens.touch).toHaveBeenCalledWith('token-id-1', now.toISOString())
      expect(mocks.mockRefreshTokens.revoke).toHaveBeenCalledWith('token-id-1', now.toISOString(), 'new-token-id')

      expect(result.accessToken).toBe('new-access-token')
      expect(result.refreshToken).toBe('new-refresh-token')
      expect(result.user).toEqual({ id: 'user-abc', email: 'test@example.com', name: 'Test User' })
    })

    it('throws InvalidRefreshTokenError when token not found', async () => {
      const mocks = makeMocks({ refreshTokenRecord: null })
      const service = createService(mocks)

      await expect(service.refresh('unknown-token')).rejects.toThrow(InvalidRefreshTokenError)
    })

    it('throws InvalidRefreshTokenError when token is revoked', async () => {
      const mocks = makeMocks({
        refreshTokenRecord: { ...validRecord, revokedAt: now.toISOString() },
      })
      const service = createService(mocks)

      await expect(service.refresh('revoked-token')).rejects.toThrow(InvalidRefreshTokenError)
    })

    it('throws InvalidRefreshTokenError when token is replaced', async () => {
      const mocks = makeMocks({
        refreshTokenRecord: { ...validRecord, replacedByTokenId: 'other-token-id' },
      })
      const service = createService(mocks)

      await expect(service.refresh('replaced-token')).rejects.toThrow(InvalidRefreshTokenError)
    })

    it('throws InvalidRefreshTokenError when token is expired and revokes it', async () => {
      const expiredRecord: RefreshTokenRecord = {
        ...validRecord,
        expiresAt: new Date(now.getTime() - 1000).toISOString(),
      }
      const mocks = makeMocks({ refreshTokenRecord: expiredRecord })
      const service = createService(mocks)

      await expect(service.refresh('expired-token')).rejects.toThrow(InvalidRefreshTokenError)
      expect(mocks.mockRefreshTokens.revoke).toHaveBeenCalledWith('token-id-1', now.toISOString())
    })

    it('throws InvalidRefreshTokenError when user not found', async () => {
      const mocks = makeMocks({ refreshTokenRecord: validRecord, user: null })
      const service = createService(mocks)

      await expect(service.refresh('no-user-token')).rejects.toThrow(InvalidRefreshTokenError)
    })

    it('throws InactiveUserError when user is inactive', async () => {
      const mocks = makeMocks({
        refreshTokenRecord: validRecord,
        user: { ...defaultUser, isActive: false },
      })
      const service = createService(mocks)

      await expect(service.refresh('inactive-user-token')).rejects.toThrow(InactiveUserError)
    })
  })

  describe('logout', () => {
    it('revokes the token when found and not revoked', async () => {
      const record: RefreshTokenRecord = {
        id: 'token-id-1',
        userId: 'user-abc',
        tokenHash: 'fingerprinted-hash',
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: now.toISOString(),
        revokedAt: null,
        replacedByTokenId: null,
        lastUsedAt: null,
        remember: false,
      }
      const mocks = makeMocks({ refreshTokenRecord: record })
      const service = createService(mocks)

      await service.logout('valid-refresh-token')

      expect(mocks.mockRefreshTokens.revoke).toHaveBeenCalledWith('token-id-1', now.toISOString())
    })

    it('is a no-op when refreshToken is null', async () => {
      const mocks = makeMocks()
      const service = createService(mocks)

      await service.logout(null)

      expect(mocks.mockTokenService.fingerprintToken).not.toHaveBeenCalled()
      expect(mocks.mockRefreshTokens.revoke).not.toHaveBeenCalled()
    })

    it('is a no-op when token is not found', async () => {
      const mocks = makeMocks({ refreshTokenRecord: null })
      const service = createService(mocks)

      await service.logout('unknown-token')

      expect(mocks.mockRefreshTokens.revoke).not.toHaveBeenCalled()
    })

    it('is a no-op when token is already revoked', async () => {
      const record: RefreshTokenRecord = {
        id: 'token-id-1',
        userId: 'user-abc',
        tokenHash: 'hash',
        expiresAt: now.toISOString(),
        createdAt: now.toISOString(),
        revokedAt: now.toISOString(),
        replacedByTokenId: null,
        lastUsedAt: null,
        remember: false,
      }
      const mocks = makeMocks({ refreshTokenRecord: record })
      const service = createService(mocks)

      await service.logout('already-revoked-token')

      expect(mocks.mockRefreshTokens.revoke).not.toHaveBeenCalled()
    })
  })

  describe('authenticateAccessToken', () => {
    it('delegates to token service', async () => {
      const mocks = makeMocks()
      const service = createService(mocks)

      const result = await service.authenticateAccessToken('some-token')

      expect(mocks.mockTokenService.verifyAccessToken).toHaveBeenCalledWith('some-token')
      expect(result.sub).toBe('user-abc')
      expect(result.email).toBe('test@example.com')
    })
  })

  describe('getAuthenticatedUser', () => {
    it('returns public user when found and active', async () => {
      const mocks = makeMocks({ user: defaultUser })
      const service = createService(mocks)

      const result = await service.getAuthenticatedUser('user-abc')

      expect(result).toEqual({ id: 'user-abc', email: 'test@example.com', name: 'Test User' })
    })

    it('throws InvalidRefreshTokenError when user not found', async () => {
      const mocks = makeMocks({ user: null })
      const service = createService(mocks)

      await expect(service.getAuthenticatedUser('unknown-id')).rejects.toThrow(InvalidRefreshTokenError)
    })

    it('throws InvalidRefreshTokenError when user is inactive', async () => {
      const mocks = makeMocks({ user: { ...defaultUser, isActive: false } })
      const service = createService(mocks)

      await expect(service.getAuthenticatedUser('inactive-id')).rejects.toThrow(InvalidRefreshTokenError)
    })
  })
})
