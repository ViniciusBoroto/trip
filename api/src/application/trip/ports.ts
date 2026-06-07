import type { ItineraryItem, Trip } from '../../domain/trip/types'

export type TripQuery = {
  search?: string
  category?: string
  page?: number
  pageSize?: number
}

export interface TripRepository {
  findAllByUser(userId: string, query?: TripQuery): Promise<{ trips: Trip[]; total: number }>
  findById(id: string): Promise<Trip | null>
  create(trip: Trip): Promise<void>
  update(id: string, trip: Partial<Trip>): Promise<void>
  delete(id: string): Promise<void>
}

export interface ItineraryItemRepository {
  findAllByTrip(tripId: string): Promise<ItineraryItem[]>
  findById(id: string): Promise<ItineraryItem | null>
  create(item: ItineraryItem): Promise<void>
  update(id: string, item: Partial<ItineraryItem>): Promise<void>
  delete(id: string): Promise<void>
  deleteAllByTrip(tripId: string): Promise<void>
}
