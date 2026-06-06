export type AuthUser = {
  id: string
  email: string
  name: string
  passwordHash: string
  isActive: boolean
}

export type RefreshTokenRecord = {
  id: string
  userId: string
  tokenHash: string
  expiresAt: string
  createdAt: string
  revokedAt: string | null
  replacedByTokenId: string | null
  lastUsedAt: string | null
  remember: boolean
}

export type AccessTokenClaims = {
  sub: string
  email: string
  name: string
  type: 'access'
  aud: string
  iss: string
  exp: number
  iat: number
}

export type PublicAuthUser = {
  id: string
  email: string
  name: string
}

export type AuthSession = {
  accessToken: string
  accessTokenExpiresAt: string
  refreshToken: string
  refreshTokenExpiresAt: string
}
