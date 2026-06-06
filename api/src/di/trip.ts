import { TripService } from '../application/trip/trip-service'
import { getDb } from '../infra/db/client'
import { D1ItineraryItemRepository } from '../infra/repositories/itinerary-item-repository'
import { D1TripRepository } from '../infra/repositories/trip-repository'
import type { AppBindings } from './bindings'

export function getTripService(bindings: AppBindings) {
  const db = getDb(bindings.DB)

  return new TripService({
    trips: new D1TripRepository(db),
    itineraryItems: new D1ItineraryItemRepository(db),
  })
}
