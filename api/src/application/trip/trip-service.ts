import {
  TripNotFoundError,
  TripAccessDeniedError,
  ItineraryItemNotFoundError,
} from '../../domain/trip/errors'
import type { PublicTrip, PublicItineraryItem, Trip, ItineraryItem } from '../../domain/trip/types'
import {
  parseCreateTripInput,
  parseCreateItineraryItemInput,
} from './trip-input'
import type { ItineraryItemRepository, TripRepository, TripQuery } from './ports'

type Dependencies = {
  trips: TripRepository
  itineraryItems: ItineraryItemRepository
}

export class TripService {
  constructor(private readonly deps: Dependencies) {}

  async listTrips(
    userId: string,
    query: TripQuery = {},
  ): Promise<{ trips: PublicTrip[]; total: number; page: number; pageSize: number }> {
    const { trips, total } = await this.deps.trips.findAllByUser(userId, query)

    const publicTrips: PublicTrip[] = []
    for (const trip of trips) {
      const items = await this.deps.itineraryItems.findAllByTrip(trip.id)
      publicTrips.push(mapToPublicTrip(trip, items))
    }

    publicTrips.sort((a, b) => a.startDate.localeCompare(b.startDate))

    return {
      trips: publicTrips,
      total,
      page: Math.max(1, query.page ?? 1),
      pageSize: Math.max(1, query.pageSize ?? 12),
    }
  }

  async getTrip(userId: string, tripId: string): Promise<PublicTrip> {
    const trip = await this.deps.trips.findById(tripId)
    if (!trip) {
      throw new TripNotFoundError()
    }

    if (trip.userId !== userId) {
      throw new TripAccessDeniedError()
    }

    const items = await this.deps.itineraryItems.findAllByTrip(trip.id)
    return mapToPublicTrip(trip, items)
  }

  async createTrip(userId: string, input: unknown): Promise<PublicTrip> {
    const parsed = parseCreateTripInput(input)
    
    const trip: Trip = {
      id: crypto.randomUUID(),
      userId,
      name: parsed.name,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      photo: parsed.photo ?? null,
      category: parsed.category ?? null,
      bookingReference: parsed.bookingReference ?? null,
      description: parsed.description ?? null,
      importantNotes: parsed.importantNotes ?? null,
      createdAt: new Date().toISOString(),
    }

    await this.deps.trips.create(trip)
    return mapToPublicTrip(trip, [])
  }

  async deleteTrip(userId: string, tripId: string): Promise<void> {
    const trip = await this.deps.trips.findById(tripId)
    if (!trip) {
      throw new TripNotFoundError()
    }

    if (trip.userId !== userId) {
      throw new TripAccessDeniedError()
    }

    // Delete all itinerary items first
    await this.deps.itineraryItems.deleteAllByTrip(tripId)
    // Delete trip
    await this.deps.trips.delete(tripId)
  }

  async addItineraryItem(
    userId: string,
    tripId: string,
    input: unknown
  ): Promise<PublicItineraryItem> {
    const trip = await this.deps.trips.findById(tripId)
    if (!trip) {
      throw new TripNotFoundError()
    }

    if (trip.userId !== userId) {
      throw new TripAccessDeniedError()
    }

    const parsed = parseCreateItineraryItemInput(input)

    const item: ItineraryItem = {
      id: crypto.randomUUID(),
      tripId,
      name: parsed.name,
      date: parsed.date,
      type: parsed.type,
      createdAt: new Date().toISOString(),
    }

    await this.deps.itineraryItems.create(item)
    return mapToPublicItineraryItem(item)
  }

  async removeItineraryItem(
    userId: string,
    tripId: string,
    itemId: string
  ): Promise<void> {
    const trip = await this.deps.trips.findById(tripId)
    if (!trip) {
      throw new TripNotFoundError()
    }

    if (trip.userId !== userId) {
      throw new TripAccessDeniedError()
    }

    const item = await this.deps.itineraryItems.findById(itemId)
    if (!item || item.tripId !== tripId) {
      throw new ItineraryItemNotFoundError()
    }

    await this.deps.itineraryItems.delete(itemId)
  }
}

function mapToPublicItineraryItem(item: ItineraryItem): PublicItineraryItem {
  return {
    id: item.id,
    name: item.name,
    date: item.date,
    type: item.type,
  }
}

function mapToPublicTrip(trip: Trip, items: ItineraryItem[]): PublicTrip {
  // Sort itinerary items by date and then name/createdAt
  const sortedItems = [...items]
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))
    .map(mapToPublicItineraryItem)

  return {
    id: trip.id,
    name: trip.name,
    startDate: trip.startDate,
    endDate: trip.endDate,
    photo: trip.photo,
    category: trip.category,
    bookingReference: trip.bookingReference,
    description: trip.description,
    importantNotes: trip.importantNotes,
    itinerary: sortedItems,
  }
}
