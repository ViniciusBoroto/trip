import type { DbBinding } from '../infra/db/client'

export interface AppBindings {
  DB: DbBinding
  RESEND_API_KEY: string
  EMAIL_FROM: string
  JWT_ACCESS_SECRET: string
  REFRESH_TOKEN_PEPPER: string
  JWT_ISSUER?: string
  JWT_AUDIENCE?: string
  APP_ORIGIN?: string
}
