import { eq } from 'drizzle-orm'

import type { ItineraryItemRepository } from '../../application/trip/ports'
import type { ItineraryItem } from '../../domain/trip/types'
import type { DbClient } from '../db/client'
import { itineraryItemsTable } from '../db/schema'

export class D1ItineraryItemRepository implements ItineraryItemRepository {
  constructor(private readonly db: DbClient) {}

  async findAllByTrip(tripId: string): Promise<ItineraryItem[]> {
    const results = await this.db.query.itineraryItemsTable.findMany({
      where: eq(itineraryItemsTable.tripId, tripId),
    })
    return results.map(mapItineraryItem)
  }

  async findById(id: string): Promise<ItineraryItem | null> {
    const result = await this.db.query.itineraryItemsTable.findFirst({
      where: eq(itineraryItemsTable.id, id),
    })
    return result ? mapItineraryItem(result) : null
  }

  async create(item: ItineraryItem): Promise<void> {
    await this.db.insert(itineraryItemsTable).values({
      id: item.id,
      tripId: item.tripId,
      name: item.name,
      date: item.date,
      type: item.type,
      createdAt: item.createdAt,
    })
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(itineraryItemsTable).where(eq(itineraryItemsTable.id, id))
  }

  async deleteAllByTrip(tripId: string): Promise<void> {
    await this.db.delete(itineraryItemsTable).where(eq(itineraryItemsTable.tripId, tripId))
  }
}

function mapItineraryItem(row: typeof itineraryItemsTable.$inferSelect): ItineraryItem {
  return {
    id: row.id,
    tripId: row.tripId,
    name: row.name,
    date: row.date,
    type: row.type,
    createdAt: row.createdAt,
  }
}
