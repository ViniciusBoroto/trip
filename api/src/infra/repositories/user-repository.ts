import { eq } from 'drizzle-orm'

import type { UserRepository } from '../../application/auth/ports'
import type { AuthUser } from '../../domain/auth/types'
import type { DbClient } from '../db/client'
import { usersTable } from '../db/schema'

export class D1UserRepository implements UserRepository {
  constructor(private readonly db: DbClient) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    const result = await this.db.query.usersTable.findFirst({
      where: eq(usersTable.email, email.toLowerCase()),
    })

    return result ? mapUser(result) : null
  }

  async findById(id: string): Promise<AuthUser | null> {
    const result = await this.db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
    })

    return result ? mapUser(result) : null
  }

  async create(input: {
    id: string
    email: string
    name: string
    passwordHash: string
    isActive: boolean
    createdAt: string
  }): Promise<AuthUser> {
    const normalizedEmail = input.email.trim().toLowerCase()

    await this.db.insert(usersTable).values({
      id: input.id,
      email: normalizedEmail,
      name: input.name,
      passwordHash: input.passwordHash,
      isActive: input.isActive,
      createdAt: input.createdAt,
    })

    return {
      id: input.id,
      email: normalizedEmail,
      name: input.name,
      passwordHash: input.passwordHash,
      isActive: input.isActive,
    }
  }
}

function mapUser(row: typeof usersTable.$inferSelect): AuthUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.passwordHash,
    isActive: row.isActive,
  }
}
