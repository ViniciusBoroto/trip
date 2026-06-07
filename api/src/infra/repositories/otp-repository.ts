import { and, eq, gt, isNull } from 'drizzle-orm'

import type { CreateOtpInput, OtpRecord, OtpRepository } from '../../application/auth/ports'
import type { DbClient } from '../db/client'
import { emailOtpsTable } from '../db/schema'

export class D1OtpRepository implements OtpRepository {
  constructor(private readonly db: DbClient) {}

  async create(input: CreateOtpInput): Promise<void> {
    await this.db.insert(emailOtpsTable).values({
      id: input.id,
      email: input.email.toLowerCase(),
      codeHash: input.codeHash,
      expiresAt: input.expiresAt,
      createdAt: input.createdAt,
    })
  }

  async findActiveByEmail(email: string, now: Date): Promise<OtpRecord | null> {
    const result = await this.db.query.emailOtpsTable.findFirst({
      where: and(
        eq(emailOtpsTable.email, email.toLowerCase()),
        gt(emailOtpsTable.expiresAt, now.toISOString()),
      ),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    })

    return result ? mapOtp(result) : null
  }

  async markUsed(id: string, usedAt: string): Promise<void> {
    await this.db
      .update(emailOtpsTable)
      .set({ usedAt })
      .where(eq(emailOtpsTable.id, id))
  }

  async revokeByEmail(email: string, usedAt: string): Promise<void> {
    await this.db
      .update(emailOtpsTable)
      .set({ usedAt })
      .where(and(eq(emailOtpsTable.email, email.toLowerCase()), isNull(emailOtpsTable.usedAt)))
  }
}

function mapOtp(row: typeof emailOtpsTable.$inferSelect): OtpRecord {
  return {
    id: row.id,
    email: row.email,
    codeHash: row.codeHash,
    expiresAt: row.expiresAt,
    usedAt: row.usedAt,
    createdAt: row.createdAt,
  }
}
