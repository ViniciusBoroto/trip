import { eq } from 'drizzle-orm'

import type { CreateRefreshTokenInput, RefreshTokenRepository } from '../../application/auth/ports'
import type { RefreshTokenRecord } from '../../domain/auth/types'
import type { DbClient } from '../db/client'
import { refreshTokensTable } from '../db/schema'

export class D1RefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly db: DbClient) {}

  async create(input: CreateRefreshTokenInput): Promise<void> {
    await this.db.insert(refreshTokensTable).values({
      id: input.id,
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      createdAt: input.createdAt,
      remember: input.remember,
    })
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const result = await this.db.query.refreshTokensTable.findFirst({
      where: eq(refreshTokensTable.tokenHash, tokenHash),
    })

    return result ? mapRefreshToken(result) : null
  }

  async revoke(tokenId: string, revokedAt: string, replacedByTokenId?: string): Promise<void> {
    await this.db
      .update(refreshTokensTable)
      .set({
        revokedAt,
        replacedByTokenId: replacedByTokenId ?? null,
      })
      .where(eq(refreshTokensTable.id, tokenId))
  }

  async touch(tokenId: string, usedAt: string): Promise<void> {
    await this.db
      .update(refreshTokensTable)
      .set({
        lastUsedAt: usedAt,
      })
      .where(eq(refreshTokensTable.id, tokenId))
  }
}

function mapRefreshToken(row: typeof refreshTokensTable.$inferSelect): RefreshTokenRecord {
  return {
    id: row.id,
    userId: row.userId,
    tokenHash: row.tokenHash,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    revokedAt: row.revokedAt,
    replacedByTokenId: row.replacedByTokenId,
    lastUsedAt: row.lastUsedAt,
    remember: row.remember,
  }
}
