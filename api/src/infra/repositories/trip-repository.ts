import { and, or, like, eq, count } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'

import type { TripQuery, TripRepository } from '../../application/trip/ports'
import type { Trip } from '../../domain/trip/types'
import type { DbClient } from '../db/client'
import { tripsTable } from '../db/schema'

export class D1TripRepository implements TripRepository {
  constructor(private readonly db: DbClient) {}

  async findAllByUser(userId: string, query?: TripQuery): Promise<{ trips: Trip[]; total: number }> {
    const page = Math.max(1, query?.page ?? 1)
    const pageSize = Math.max(1, Math.min(100, query?.pageSize ?? 12))

    const conditions: SQL[] = [eq(tripsTable.userId, userId)]

    if (query?.search) {
      const pattern = `%${query.search}%`
      conditions.push(
        or(
          like(tripsTable.name, pattern),
          like(tripsTable.description, pattern),
          like(tripsTable.category, pattern),
        )!,
      )
    }

    if (query?.category) {
      conditions.push(eq(tripsTable.category, query.category))
    }

    const [{ count: total }] = await this.db
      .select({ count: count() })
      .from(tripsTable)
      .where(and(...conditions))

    const results = await this.db
      .select()
      .from(tripsTable)
      .where(and(...conditions))
      .limit(pageSize)
      .offset((page - 1) * pageSize)

    return { trips: results.map(mapTrip), total }
  }

  async findById(id: string): Promise<Trip | null> {
    const result = await this.db.query.tripsTable.findFirst({
      where: eq(tripsTable.id, id),
    })
    return result ? mapTrip(result) : null
  }

  async create(trip: Trip): Promise<void> {
    await this.db.insert(tripsTable).values({
      id: trip.id,
      userId: trip.userId,
      name: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      photo: trip.photo,
      category: trip.category,
      bookingReference: trip.bookingReference,
      description: trip.description,
      importantNotes: trip.importantNotes,
      createdAt: trip.createdAt,
    })
  }

  async update(id: string, data: Partial<Trip>): Promise<void> {
    await this.db.update(tripsTable).set(data).where(eq(tripsTable.id, id))
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(tripsTable).where(eq(tripsTable.id, id))
  }
}

function mapTrip(row: typeof tripsTable.$inferSelect): Trip {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    startDate: row.startDate,
    endDate: row.endDate,
    photo: row.photo,
    category: row.category,
    bookingReference: row.bookingReference,
    description: row.description,
    importantNotes: row.importantNotes,
    createdAt: row.createdAt,
  }
}
