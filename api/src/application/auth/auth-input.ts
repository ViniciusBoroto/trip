import { z } from 'zod'

import { InvalidAuthInputError } from '../../domain/auth/errors'

export type LoginInput = {
  email: string
  password: string
  remember: boolean
}

export type RegisterInput = {
  name: string
  email: string
  password: string
  remember: boolean
}

const emailSchema = z.string().email()

const loginInputSchema = z
  .object({
    email: z.unknown().optional(),
    password: z.unknown().optional(),
    remember: z.unknown().optional(),
  })
  .superRefine((value, ctx) => {
    const email = typeof value.email === 'string' ? value.email.trim() : ''
    const password = typeof value.password === 'string' ? value.password : ''

    if (!email || !password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Email and password are required.',
      })
      return
    }

    if (!emailSchema.safeParse(email).success) {
      ctx.addIssue({
        code: 'custom',
        message: 'Email must be valid.',
      })
    }
  })
  .transform<LoginInput>((value) => ({
    email: (value.email as string).trim().toLowerCase(),
    password: value.password as string,
    remember: value.remember === true,
  }))

const registerInputSchema = z
  .object({
    name: z.unknown().optional(),
    email: z.unknown().optional(),
    password: z.unknown().optional(),
    remember: z.unknown().optional(),
  })
  .superRefine((value, ctx) => {
    const name = typeof value.name === 'string' ? value.name.trim() : ''
    const email = typeof value.email === 'string' ? value.email.trim() : ''
    const password = typeof value.password === 'string' ? value.password : ''

    if (!name || !email || !password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Name, email, and password are required.',
      })
      return
    }

    if (!emailSchema.safeParse(email).success) {
      ctx.addIssue({
        code: 'custom',
        message: 'Email must be valid.',
      })
    }

    if (password.length < 8) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password must be at least 8 characters.',
      })
    }
  })
  .transform<RegisterInput>((value) => ({
    name: (value.name as string).trim(),
    email: (value.email as string).trim().toLowerCase(),
    password: value.password as string,
    remember: value.remember === true,
  }))

export function parseLoginInput(input: unknown): LoginInput {
  const result = loginInputSchema.safeParse(input)

  if (!result.success) {
    throw new InvalidAuthInputError(result.error.issues[0]?.message ?? 'Authentication input is invalid.')
  }

  return result.data
}

export function parseRegisterInput(input: unknown): RegisterInput {
  const result = registerInputSchema.safeParse(input)

  if (!result.success) {
    throw new InvalidAuthInputError(result.error.issues[0]?.message ?? 'Authentication input is invalid.')
  }

  return result.data
}

export type SendOtpInput = { email: string }
export type VerifyOtpInput = { email: string; code: string; remember: boolean }

const sendOtpInputSchema = z
  .object({ email: z.unknown().optional() })
  .superRefine((value, ctx) => {
    const email = typeof value.email === 'string' ? value.email.trim() : ''
    if (!email) {
      ctx.addIssue({ code: 'custom', message: 'Email is required.' })
      return
    }
    if (!emailSchema.safeParse(email).success) {
      ctx.addIssue({ code: 'custom', message: 'Email must be valid.' })
    }
  })
  .transform<SendOtpInput>((value) => ({ email: (value.email as string).trim().toLowerCase() }))

const verifyOtpInputSchema = z
  .object({
    email: z.unknown().optional(),
    code: z.unknown().optional(),
    remember: z.unknown().optional(),
  })
  .superRefine((value, ctx) => {
    const email = typeof value.email === 'string' ? value.email.trim() : ''
    const code = typeof value.code === 'string' ? value.code.trim() : ''
    if (!email) {
      ctx.addIssue({ code: 'custom', message: 'Email is required.' })
      return
    }
    if (!emailSchema.safeParse(email).success) {
      ctx.addIssue({ code: 'custom', message: 'Email must be valid.' })
    }
    if (!code || !/^\d{6}$/.test(code)) {
      ctx.addIssue({ code: 'custom', message: 'Code must be a 6-digit number.' })
    }
  })
  .transform<VerifyOtpInput>((value) => ({
    email: (value.email as string).trim().toLowerCase(),
    code: (value.code as string).trim(),
    remember: value.remember === true,
  }))

export function parseSendOtpInput(input: unknown): SendOtpInput {
  const result = sendOtpInputSchema.safeParse(input)
  if (!result.success) {
    throw new InvalidAuthInputError(result.error.issues[0]?.message ?? 'OTP input is invalid.')
  }
  return result.data
}

export function parseVerifyOtpInput(input: unknown): VerifyOtpInput {
  const result = verifyOtpInputSchema.safeParse(input)
  if (!result.success) {
    throw new InvalidAuthInputError(result.error.issues[0]?.message ?? 'OTP input is invalid.')
  }
  return result.data
}
