import type { ItineraryItem, Trip } from '../../domain/trip/types'

export interface TripRepository {
  findAllByUser(userId: string): Promise<Trip[]>
  findById(id: string): Promise<Trip | null>
  create(trip: Trip): Promise<void>
  delete(id: string): Promise<void>
}

export interface ItineraryItemRepository {
  findAllByTrip(tripId: string): Promise<ItineraryItem[]>
  findById(id: string): Promise<ItineraryItem | null>
  create(item: ItineraryItem): Promise<void>
  delete(id: string): Promise<void>
  deleteAllByTrip(tripId: string): Promise<void>
}
