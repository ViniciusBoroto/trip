import { describe, it, expect, beforeEach } from 'bun:test'

import { AuthConfigurationError, UnauthorizedError } from '../../../domain/auth/errors'
import type { AuthUser } from '../../../domain/auth/types'
import { JwtTokenService } from '../../../infra/auth/token-service'

const testUser: AuthUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: 'hash',
  isActive: true,
}

function createService(overrides: Partial<{
  accessSecret: string
  refreshPepper: string
  issuer: string
  audience: string
  accessTokenTtlSeconds: number
  refreshTokenTtlSeconds: number
  refreshTokenTtlRememberSeconds: number
}> = {}) {
  return new JwtTokenService({
    accessSecret: overrides.accessSecret ?? 'test-access-secret-32chars-long!!',
    refreshPepper: overrides.refreshPepper ?? 'test-refresh-pepper',
    issuer: overrides.issuer ?? 'test-issuer',
    audience: overrides.audience ?? 'test-audience',
    accessTokenTtlSeconds: overrides.accessTokenTtlSeconds ?? 15 * 60,
    refreshTokenTtlSeconds: overrides.refreshTokenTtlSeconds ?? 7 * 24 * 60 * 60,
    refreshTokenTtlRememberSeconds: overrides.refreshTokenTtlRememberSeconds ?? 30 * 24 * 60 * 60,
  })
}

describe('JwtTokenService', () => {
  describe('constructor', () => {
    it('throws AuthConfigurationError when access secret is empty', () => {
      expect(() => createService({ accessSecret: '' })).toThrow(AuthConfigurationError)
      expect(() => createService({ accessSecret: '' })).toThrow('JWT_ACCESS_SECRET binding is required.')
    })

    it('throws AuthConfigurationError when refresh pepper is empty', () => {
      expect(() => createService({ refreshPepper: '' })).toThrow(AuthConfigurationError)
      expect(() => createService({ refreshPepper: '' })).toThrow('REFRESH_TOKEN_PEPPER binding is required.')
    })
  })

  describe('issueSession', () => {
    it('returns access and refresh tokens', async () => {
      const service = createService()
      const session = await service.issueSession(testUser, false)

      expect(session.accessToken).toBeTruthy()
      expect(typeof session.accessToken).toBe('string')
      expect(session.accessToken).toContain('.')
      expect(session.refreshToken).toBeTruthy()
      expect(typeof session.refreshToken).toBe('string')
    })

    it('sets correct access token expiry (15 minutes)', async () => {
      const service = createService({ accessTokenTtlSeconds: 15 * 60 })
      const before = service.now().getTime()
      const session = await service.issueSession(testUser, false)
      const after = service.now().getTime()

      const expiresAt = new Date(session.accessTokenExpiresAt).getTime()
      expect(expiresAt).toBeGreaterThanOrEqual(before + 14 * 60 * 1000)
      expect(expiresAt).toBeLessThanOrEqual(after + 16 * 60 * 1000)
    })

    it('sets short refresh token expiry (7 days) when remember is false', async () => {
      const service = createService()
      const session = await service.issueSession(testUser, false)
      const sevenDays = 7 * 24 * 60 * 60 * 1000

      const expiresAt = new Date(session.refreshTokenExpiresAt).getTime()
      const now = service.now().getTime()
      expect(expiresAt - now).toBeGreaterThan(sevenDays - 5000)
      expect(expiresAt - now).toBeLessThan(sevenDays + 5000)
    })

    it('sets long refresh token expiry (30 days) when remember is true', async () => {
      const service = createService()
      const session = await service.issueSession(testUser, true)
      const thirtyDays = 30 * 24 * 60 * 60 * 1000

      const expiresAt = new Date(session.refreshTokenExpiresAt).getTime()
      const now = service.now().getTime()
      expect(expiresAt - now).toBeGreaterThan(thirtyDays - 5000)
      expect(expiresAt - now).toBeLessThan(thirtyDays + 5000)
    })

    it('produces unique refresh tokens on each call', async () => {
      const service = createService()
      const s1 = await service.issueSession(testUser, false)
      const s2 = await service.issueSession(testUser, false)

      expect(s1.refreshToken).not.toBe(s2.refreshToken)
    })
  })

  describe('verifyAccessToken', () => {
    it('returns claims for a valid token', async () => {
      const service = createService()
      const { accessToken } = await service.issueSession(testUser, false)

      const claims = await service.verifyAccessToken(accessToken)

      expect(claims.sub).toBe('user-123')
      expect(claims.email).toBe('test@example.com')
      expect(claims.name).toBe('Test User')
      expect(claims.type).toBe('access')
      expect(claims.iss).toBe('test-issuer')
      expect(claims.aud).toBe('test-audience')
      expect(typeof claims.exp).toBe('number')
      expect(typeof claims.iat).toBe('number')
    })

    it('throws UnauthorizedError for a token signed with different secret', async () => {
      const service1 = createService({ accessSecret: 'secret-one-abcdefghijklmnopqrstuv' })
      const service2 = createService({ accessSecret: 'secret-two-abcdefghijklmnopqrstuv' })
      const { accessToken } = await service1.issueSession(testUser, false)

      expect(service2.verifyAccessToken(accessToken)).rejects.toThrow(UnauthorizedError)
    })

    it('throws UnauthorizedError for an expired token', async () => {
      const service = createService({ accessTokenTtlSeconds: 0 })
      const { accessToken } = await service.issueSession(testUser, false)

      await expect(service.verifyAccessToken(accessToken)).rejects.toThrow(UnauthorizedError)
    })

    it('throws UnauthorizedError for a garbage token', async () => {
      const service = createService()

      await expect(service.verifyAccessToken('not-a-jwt')).rejects.toThrow(UnauthorizedError)
    })

    it('throws UnauthorizedError for a token with wrong issuer', async () => {
      const service = createService({ issuer: 'real-issuer' })
      const fakeService = createService({ issuer: 'fake-issuer' })
      const { accessToken } = await fakeService.issueSession(testUser, false)

      await expect(service.verifyAccessToken(accessToken)).rejects.toThrow(UnauthorizedError)
    })

    it('throws UnauthorizedError for a token with wrong audience', async () => {
      const service = createService({ audience: 'real-audience' })
      const fakeService = createService({ audience: 'fake-audience' })
      const { accessToken } = await fakeService.issueSession(testUser, false)

      await expect(service.verifyAccessToken(accessToken)).rejects.toThrow(UnauthorizedError)
    })

    it('throws UnauthorizedError when payload is missing required fields', async () => {
      const service = createService()
      const { accessToken } = await service.issueSession(testUser, false)

      const [header, _, sig] = accessToken.split('.')
      const tamperedPayload = btoa(JSON.stringify({ sub: 'user-123' }))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      const tamperedToken = `${header}.${tamperedPayload}.${sig}`

      await expect(service.verifyAccessToken(tamperedToken)).rejects.toThrow(UnauthorizedError)
    })
  })

  describe('fingerprintToken', () => {
    it('produces a hex string', async () => {
      const service = createService()
      const fp = await service.fingerprintToken('some-token')

      expect(fp).toMatch(/^[a-f0-9]{64}$/)
    })

    it('returns the same hash for the same token', async () => {
      const service = createService()
      const fp1 = await service.fingerprintToken('consistent-token')
      const fp2 = await service.fingerprintToken('consistent-token')

      expect(fp1).toBe(fp2)
    })

    it('returns different hashes for different tokens', async () => {
      const service = createService()
      const fp1 = await service.fingerprintToken('token-a')
      const fp2 = await service.fingerprintToken('token-b')

      expect(fp1).not.toBe(fp2)
    })

    it('returns different hashes with different pepper', async () => {
      const service1 = createService({ refreshPepper: 'pepper-a' })
      const service2 = createService({ refreshPepper: 'pepper-b' })
      const fp1 = await service1.fingerprintToken('same-token')
      const fp2 = await service2.fingerprintToken('same-token')

      expect(fp1).not.toBe(fp2)
    })
  })

  describe('generateRefreshTokenId', () => {
    it('returns a UUID', () => {
      const service = createService()
      const id = service.generateRefreshTokenId()

      expect(id).toMatch(/^[0-9a-f-]{36}$/)
    })

    it('returns unique values', () => {
      const service = createService()
      const id1 = service.generateRefreshTokenId()
      const id2 = service.generateRefreshTokenId()

      expect(id1).not.toBe(id2)
    })
  })

  describe('now', () => {
    it('returns a Date', () => {
      const service = createService()

      expect(service.now()).toBeInstanceOf(Date)
    })
  })
})
