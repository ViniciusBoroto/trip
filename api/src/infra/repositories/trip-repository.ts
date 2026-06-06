import { eq } from 'drizzle-orm'

import type { TripRepository } from '../../application/trip/ports'
import type { Trip } from '../../domain/trip/types'
import type { DbClient } from '../db/client'
import { tripsTable } from '../db/schema'

export class D1TripRepository implements TripRepository {
  constructor(private readonly db: DbClient) {}

  async findAllByUser(userId: string): Promise<Trip[]> {
    const results = await this.db.query.tripsTable.findMany({
      where: eq(tripsTable.userId, userId),
    })
    return results.map(mapTrip)
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
