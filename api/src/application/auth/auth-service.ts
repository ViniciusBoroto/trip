import {
  EmailAlreadyTakenError,
  InactiveUserError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
} from '../../domain/auth/errors'
import type { AccessTokenClaims, AuthUser, PublicAuthUser } from '../../domain/auth/types'
import { parseLoginInput, parseRegisterInput } from './auth-input'
import type {
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
