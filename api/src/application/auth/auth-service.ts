import {
  EmailAlreadyTakenError,
  InactiveUserError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  OtpExpiredOrUsedError,
  OtpNotFoundError,
} from '../../domain/auth/errors'
import type { AccessTokenClaims, AuthUser, PublicAuthUser } from '../../domain/auth/types'
import { parseLoginInput, parseRegisterInput, parseSendOtpInput, parseVerifyOtpInput } from './auth-input'
import type {
  EmailSender,
  OtpRepository,
  PasswordHasher,
  RefreshTokenRepository,
  TokenService,
  UserRepository,
} from './ports'

type Dependencies = {
  users: UserRepository
  refreshTokens: RefreshTokenRepository
  passwordHasher: PasswordHasher
  tokenService: TokenService
  otps: OtpRepository
  emailSender: EmailSender
}

export class AuthService {
  constructor(private readonly deps: Dependencies) {}

  async register(input: unknown) {
    const { name, email, password, remember } = parseRegisterInput(input)
    const existingUser = await this.deps.users.findByEmail(email)

    if (existingUser) {
      throw new EmailAlreadyTakenError()
    }

    const passwordHash = await this.deps.passwordHasher.hash(password)

    try {
      const user = await this.deps.users.create({
        id: crypto.randomUUID(),
        email,
        name,
        passwordHash,
        isActive: true,
        createdAt: this.deps.tokenService.now().toISOString(),
      })

      return this.createSession(user, remember)
    } catch (error) {
      if (isDuplicateEmailError(error)) {
        throw new EmailAlreadyTakenError()
      }

      throw error
    }
  }

  async login(input: unknown) {
    const { email, password, remember } = parseLoginInput(input)
    const user = await this.deps.users.findByEmail(email)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    if (!user.isActive) {
      throw new InactiveUserError()
    }

    if (!user.passwordHash) {
      // OTP-only account — cannot sign in with password
      throw new InvalidCredentialsError()
    }

    const passwordMatches = await this.deps.passwordHasher.verify(password, user.passwordHash)

    if (!passwordMatches) {
      throw new InvalidCredentialsError()
    }

    return this.createSession(user, remember)
  }

  async refresh(refreshToken: string) {
    const tokenHash = await this.deps.tokenService.fingerprintToken(refreshToken)
    const currentToken = await this.deps.refreshTokens.findByTokenHash(tokenHash)

    if (!currentToken || currentToken.revokedAt || currentToken.replacedByTokenId) {
      throw new InvalidRefreshTokenError()
    }

    if (new Date(currentToken.expiresAt).getTime() <= this.deps.tokenService.now().getTime()) {
      await this.deps.refreshTokens.revoke(currentToken.id, this.deps.tokenService.now().toISOString())
      throw new InvalidRefreshTokenError()
    }

    const user = await this.deps.users.findById(currentToken.userId)

    if (!user) {
      throw new InvalidRefreshTokenError()
    }

    if (!user.isActive) {
      throw new InactiveUserError()
    }

    const nextSession = await this.deps.tokenService.issueSession(user, currentToken.remember)
    const nextTokenId = this.deps.tokenService.generateRefreshTokenId()
    const nextTokenHash = await this.deps.tokenService.fingerprintToken(nextSession.refreshToken)
    const now = this.deps.tokenService.now().toISOString()

    await this.deps.refreshTokens.create({
      id: nextTokenId,
      userId: user.id,
      tokenHash: nextTokenHash,
      expiresAt: nextSession.refreshTokenExpiresAt,
      createdAt: now,
      remember: currentToken.remember,
    })

    await this.deps.refreshTokens.touch(currentToken.id, now)
    await this.deps.refreshTokens.revoke(currentToken.id, now, nextTokenId)

    return {
      user: toPublicUser(user.id, user.email, user.name),
      ...nextSession,
    }
  }

  async logout(refreshToken: string | null) {
    if (!refreshToken) {
      return
    }

    const tokenHash = await this.deps.tokenService.fingerprintToken(refreshToken)
    const currentToken = await this.deps.refreshTokens.findByTokenHash(tokenHash)

    if (!currentToken || currentToken.revokedAt) {
      return
    }

    await this.deps.refreshTokens.revoke(currentToken.id, this.deps.tokenService.now().toISOString())
  }

  async authenticateAccessToken(token: string): Promise<AccessTokenClaims> {
    return this.deps.tokenService.verifyAccessToken(token)
  }

  async getAuthenticatedUser(userId: string): Promise<PublicAuthUser> {
    const user = await this.deps.users.findById(userId)

    if (!user || !user.isActive) {
      throw new InvalidRefreshTokenError()
    }

    return toPublicUser(user.id, user.email, user.name)
  }

  async sendOtp(input: unknown): Promise<void> {
    const { email } = parseSendOtpInput(input)
    const code = generateOtpCode()
    const codeHash = await hashOtpCode(code)
    const now = this.deps.tokenService.now()
    const expiresAt = new Date(now.getTime() + OTP_TTL_MS)

    await this.deps.otps.revokeByEmail(email, now.toISOString())

    await this.deps.otps.create({
      id: crypto.randomUUID(),
      email,
      codeHash,
      expiresAt: expiresAt.toISOString(),
      createdAt: now.toISOString(),
    })

    await this.deps.emailSender.sendOtp(email, code)
  }

  async verifyOtp(input: unknown) {
    const { email, code, remember } = parseVerifyOtpInput(input)
    const now = this.deps.tokenService.now()
    const otp = await this.deps.otps.findActiveByEmail(email, now)

    if (!otp) {
      throw new OtpNotFoundError()
    }

    if (otp.usedAt || new Date(otp.expiresAt).getTime() <= now.getTime()) {
      throw new OtpExpiredOrUsedError()
    }

    const submittedHash = await hashOtpCode(code)
    if (submittedHash !== otp.codeHash) {
      throw new OtpNotFoundError()
    }

    await this.deps.otps.markUsed(otp.id, now.toISOString())

    let user = await this.deps.users.findByEmail(email)

    if (!user) {
      const emailPrefix = email.split('@')[0] ?? email
      user = await this.deps.users.create({
        id: crypto.randomUUID(),
        email,
        name: emailPrefix,
        passwordHash: null,
        isActive: true,
        createdAt: now.toISOString(),
      })
    }

    if (!user.isActive) {
      throw new InactiveUserError()
    }

    return this.createSession(user, remember)
  }

  private async createSession(user: AuthUser, remember: boolean) {
    const session = await this.deps.tokenService.issueSession(user, remember)
    const tokenHash = await this.deps.tokenService.fingerprintToken(session.refreshToken)

    await this.deps.refreshTokens.create({
      id: this.deps.tokenService.generateRefreshTokenId(),
      userId: user.id,
      tokenHash,
      expiresAt: session.refreshTokenExpiresAt,
      createdAt: this.deps.tokenService.now().toISOString(),
      remember,
    })

    return {
      user: toPublicUser(user.id, user.email, user.name),
      ...session,
    }
  }
}

function toPublicUser(id: string, email: string, name: string): PublicAuthUser {
  return { id, email, name }
}

function isDuplicateEmailError(error: unknown) {
  if (!(error instanceof Error)) {
    return false
  }

  return /unique/i.test(error.message) && /users\.email|email/i.test(error.message)
}

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes

function generateOtpCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(4))
  const num = ((bytes[0]! << 24) | (bytes[1]! << 16) | (bytes[2]! << 8) | bytes[3]!) >>> 0
  return String(num % 1_000_000).padStart(6, '0')
}

const encoder = new TextEncoder()

async function hashOtpCode(code: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(code))
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}
