import { describe, it, expect } from 'bun:test'

import {
  AuthConfigurationError,
  EmailAlreadyTakenError,
  InactiveUserError,
  InvalidAuthInputError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  UnauthorizedError,
} from '../../../domain/auth/errors'

describe('InvalidCredentialsError', () => {
  it('has correct name and message', () => {
    const error = new InvalidCredentialsError()
    expect(error.name).toBe('InvalidCredentialsError')
    expect(error.message).toBe('Invalid email or password.')
  })
})

describe('InvalidAuthInputError', () => {
  it('has correct name and custom message', () => {
    const error = new InvalidAuthInputError('Name is required.')
    expect(error.name).toBe('InvalidAuthInputError')
    expect(error.message).toBe('Name is required.')
  })
})

describe('EmailAlreadyTakenError', () => {
  it('has correct name and message', () => {
    const error = new EmailAlreadyTakenError()
    expect(error.name).toBe('EmailAlreadyTakenError')
    expect(error.message).toBe('An account with this email already exists.')
  })
})

describe('InactiveUserError', () => {
  it('has correct name and message', () => {
    const error = new InactiveUserError()
    expect(error.name).toBe('InactiveUserError')
    expect(error.message).toBe('User account is inactive.')
  })
})

describe('InvalidRefreshTokenError', () => {
  it('has correct name and message', () => {
    const error = new InvalidRefreshTokenError()
    expect(error.name).toBe('InvalidRefreshTokenError')
    expect(error.message).toBe('Refresh token is invalid or expired.')
  })
})

describe('UnauthorizedError', () => {
  it('has correct name and default message', () => {
    const error = new UnauthorizedError()
    expect(error.name).toBe('UnauthorizedError')
    expect(error.message).toBe('Authentication required.')
  })

  it('accepts custom message', () => {
    const error = new UnauthorizedError('Custom message.')
    expect(error.message).toBe('Custom message.')
  })
})

describe('AuthConfigurationError', () => {
  it('has correct name and message', () => {
    const error = new AuthConfigurationError('Missing secret.')
    expect(error.name).toBe('AuthConfigurationError')
    expect(error.message).toBe('Missing secret.')
  })
})
