import { describe, it, expect } from 'bun:test'

import { InvalidAuthInputError } from '../../../domain/auth/errors'
import { parseLoginInput, parseRegisterInput } from '../../../application/auth/auth-input'

describe('parseLoginInput', () => {
  it('parses valid input', () => {
    const result = parseLoginInput({ email: 'Test@Example.com', password: 'secret', remember: true })

    expect(result.email).toBe('test@example.com')
    expect(result.password).toBe('secret')
    expect(result.remember).toBe(true)
  })

  it('defaults remember to false', () => {
    const result = parseLoginInput({ email: 'test@example.com', password: 'secret' })

    expect(result.remember).toBe(false)
  })

  it('trims email', () => {
    const result = parseLoginInput({ email: '  test@example.com  ', password: 'secret' })

    expect(result.email).toBe('test@example.com')
  })

  it('throws on missing email', () => {
    expect(() => parseLoginInput({ password: 'secret' })).toThrow(InvalidAuthInputError)
    expect(() => parseLoginInput({ password: 'secret' })).toThrow('Email and password are required.')
  })

  it('throws on missing password', () => {
    expect(() => parseLoginInput({ email: 'test@example.com' })).toThrow(InvalidAuthInputError)
    expect(() => parseLoginInput({ email: 'test@example.com' })).toThrow('Email and password are required.')
  })

  it('throws on empty email string', () => {
    expect(() => parseLoginInput({ email: '', password: 'secret' })).toThrow(InvalidAuthInputError)
  })

  it('throws on invalid email format', () => {
    expect(() => parseLoginInput({ email: 'not-an-email', password: 'secret' })).toThrow(InvalidAuthInputError)
    expect(() => parseLoginInput({ email: 'not-an-email', password: 'secret' })).toThrow('Email must be valid.')
  })

  it('throws on null body', () => {
    expect(() => parseLoginInput(null)).toThrow(InvalidAuthInputError)
  })

  it('throws on undefined body', () => {
    expect(() => parseLoginInput(undefined)).toThrow(InvalidAuthInputError)
  })
})

describe('parseRegisterInput', () => {
  it('parses valid input', () => {
    const result = parseRegisterInput({
      name: 'John',
      email: 'Test@Example.com',
      password: 'longenough',
      remember: true,
    })

    expect(result.name).toBe('John')
    expect(result.email).toBe('test@example.com')
    expect(result.password).toBe('longenough')
    expect(result.remember).toBe(true)
  })

  it('defaults remember to false', () => {
    const result = parseRegisterInput({ name: 'John', email: 'test@example.com', password: 'longenough' })

    expect(result.remember).toBe(false)
  })

  it('trims name and email', () => {
    const result = parseRegisterInput({
      name: '  John  ',
      email: '  test@example.com  ',
      password: 'longenough',
    })

    expect(result.name).toBe('John')
    expect(result.email).toBe('test@example.com')
  })

  it('throws on missing name', () => {
    expect(() =>
      parseRegisterInput({ email: 'test@example.com', password: 'longenough' }),
    ).toThrow(InvalidAuthInputError)
    expect(() =>
      parseRegisterInput({ email: 'test@example.com', password: 'longenough' }),
    ).toThrow('Name, email, and password are required.')
  })

  it('throws on missing email', () => {
    expect(() => parseRegisterInput({ name: 'John', password: 'longenough' })).toThrow(InvalidAuthInputError)
  })

  it('throws on missing password', () => {
    expect(() => parseRegisterInput({ name: 'John', email: 'test@example.com' })).toThrow(InvalidAuthInputError)
  })

  it('throws on empty name string', () => {
    expect(() =>
      parseRegisterInput({ name: '', email: 'test@example.com', password: 'longenough' }),
    ).toThrow(InvalidAuthInputError)
  })

  it('throws on short password', () => {
    expect(() =>
      parseRegisterInput({ name: 'John', email: 'test@example.com', password: 'short' }),
    ).toThrow(InvalidAuthInputError)
    expect(() =>
      parseRegisterInput({ name: 'John', email: 'test@example.com', password: 'short' }),
    ).toThrow('Password must be at least 8 characters.')
  })

  it('throws on invalid email format', () => {
    expect(() =>
      parseRegisterInput({ name: 'John', email: 'bad-email', password: 'longenough' }),
    ).toThrow(InvalidAuthInputError)
    expect(() =>
      parseRegisterInput({ name: 'John', email: 'bad-email', password: 'longenough' }),
    ).toThrow('Email must be valid.')
  })

  it('throws on null body', () => {
    expect(() => parseRegisterInput(null)).toThrow(InvalidAuthInputError)
  })
})
