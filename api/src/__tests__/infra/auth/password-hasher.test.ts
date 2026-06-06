import { describe, it, expect } from 'bun:test'

import { Pbkdf2PasswordHasher } from '../../../infra/auth/password-hasher'

const hasher = new Pbkdf2PasswordHasher()

describe('Pbkdf2PasswordHasher', () => {
  describe('hash', () => {
    it('produces a hash with the expected format', async () => {
      const hash = await hasher.hash('my-password')

      expect(hash).toMatch(/^pbkdf2_sha256\$100000\$[a-f0-9]{32}\$[a-f0-9]{64}$/)
    })

    it('produces different hashes for the same password (different salt)', async () => {
      const hash1 = await hasher.hash('same-password')
      const hash2 = await hasher.hash('same-password')

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verify', () => {
    it('returns true for the correct password', async () => {
      const hash = await hasher.hash('my-password')

      const result = await hasher.verify('my-password', hash)

      expect(result).toBe(true)
    })

    it('returns false for an incorrect password', async () => {
      const hash = await hasher.hash('my-password')

      const result = await hasher.verify('wrong-password', hash)

      expect(result).toBe(false)
    })

    it('returns false for a malformed hash', async () => {
      const result = await hasher.verify('password', 'not-a-valid-hash')

      expect(result).toBe(false)
    })

    it('returns false for a hash with wrong algorithm prefix', async () => {
      const result = await hasher.verify('password', 'bcrypt$10$salt$hash')

      expect(result).toBe(false)
    })

    it('returns false for a hash with non-integer iterations', async () => {
      const result = await hasher.verify('password', 'pbkdf2_sha256$abc$salt$hash')

      expect(result).toBe(false)
    })

    it('returns false for a hash with zero iterations', async () => {
      const result = await hasher.verify('password', 'pbkdf2_sha256$0$salt$hash')

      expect(result).toBe(false)
    })

    it('returns false for an empty password', async () => {
      const hash = await hasher.hash('some-password')

      const result = await hasher.verify('', hash)

      expect(result).toBe(false)
    })

    it('returns false for hash with missing components', async () => {
      const result = await hasher.verify('password', 'pbkdf2_sha256$100000$salt')

      expect(result).toBe(false)
    })
  })
})
