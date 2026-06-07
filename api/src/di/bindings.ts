import type { DbBinding } from '../infra/db/client'
import type { EmailBinding } from '../infra/email/cf-email-sender'

export interface AppBindings {
  DB: DbBinding
  EMAIL: EmailBinding
  EMAIL_FROM: string
  JWT_ACCESS_SECRET: string
  REFRESH_TOKEN_PEPPER: string
  JWT_ISSUER?: string
  JWT_AUDIENCE?: string
  APP_ORIGIN?: string
}
