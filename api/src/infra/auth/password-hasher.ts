import type { PasswordHasher } from '../../application/auth/ports'

const encoder = new TextEncoder()

export class Pbkdf2PasswordHasher implements PasswordHasher {
  async verify(password: string, passwordHash: string): Promise<boolean> {
    const [algorithm, iterationsRaw, salt, expectedHash] = passwordHash.split('$')

    if (algorithm !== 'pbkdf2_sha256' || !iterationsRaw || !salt || !expectedHash) {
      return false
    }

    const iterations = Number(iterationsRaw)

    if (!Number.isInteger(iterations) || iterations < 1) {
      return false
    }

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    )

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt: encoder.encode(salt),
        iterations,
      },
      keyMaterial,
      256,
    )

    const actualHash = toHex(new Uint8Array(derivedBits))
    return timingSafeEqual(actualHash, expectedHash)
  }
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false
  }

  let mismatch = 0

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }

  return mismatch === 0
}
