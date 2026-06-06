import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { TripService } from '../../../application/trip/trip-service'
import {
  TripNotFoundError,
  TripAccessDeniedError,
  ItineraryItemNotFoundError,
} from '../../../domain/trip/errors'
import type { Trip, ItineraryItem } from '../../../domain/trip/types'

describe('TripService', () => {
  let mockTripsRepo: any
  let mockItineraryRepo: any
  let tripService: TripService

  const mockTrip: Trip = {
    id: 'trip-1',
    userId: 'user-1',
    name: 'Italian Summer',
    startDate: '2026-06-10',
    endDate: '2026-06-20',
    photo: null,
    category: 'beach',
    bookingReference: null,
    description: null,
    importantNotes: null,
    createdAt: '2026-06-06T00:00:00.000Z',
  }

  const mockItem: ItineraryItem = {
    id: 'item-1',
    tripId: 'trip-1',
    name: 'Colosseum Tour',
    date: '2026-06-11',
    type: 'activity',
    createdAt: '2026-06-06T01:00:00.000Z',
  }

  beforeEach(() => {
    mockTripsRepo = {
      findAllByUser: mock(() => Promise.resolve([mockTrip])),
      findById: mock((id: string) => {
        if (id === 'trip-1') return Promise.resolve(mockTrip)
        return Promise.resolve(null)
      }),
      create: mock(() => Promise.resolve()),
      delete: mock(() => Promise.resolve()),
    }

    mockItineraryRepo = {
      findAllByTrip: mock(() => Promise.resolve([mockItem])),
      findById: mock((id: string) => {
        if (id === 'item-1') return Promise.resolve(mockItem)
        return Promise.resolve(null)
      }),
      create: mock(() => Promise.resolve()),
      delete: mock(() => Promise.resolve()),
      deleteAllByTrip: mock(() => Promise.resolve()),
    }

    tripService = new TripService({
      trips: mockTripsRepo,
      itineraryItems: mockItineraryRepo,
    })
  })

  it('lists trips sorted by startDate', async () => {
    const list = await tripService.listTrips('user-1')
    expect(list.length).toBe(1)
    expect(list[0].name).toBe('Italian Summer')
    expect(list[0].itinerary.length).toBe(1)
    expect(list[0].itinerary[0].name).toBe('Colosseum Tour')
  })

  it('gets a single trip if authorized', async () => {
    const details = await tripService.getTrip('user-1', 'trip-1')
    expect(details.name).toBe('Italian Summer')
  })

  it('throws AccessDeniedError if accessing another user\'s trip', async () => {
    expect(tripService.getTrip('user-2', 'trip-1')).rejects.toThrow(TripAccessDeniedError)
  })

  it('throws NotFoundError if trip does not exist', async () => {
    expect(tripService.getTrip('user-1', 'nonexistent')).rejects.toThrow(TripNotFoundError)
  })

  it('creates a new trip', async () => {
    const input = {
      name: 'Business Trip',
      startDate: '2026-07-01',
      endDate: '2026-07-05',
    }
    const created = await tripService.createTrip('user-1', input)
    expect(created.name).toBe('Business Trip')
    expect(created.startDate).toBe('2026-07-01')
    expect(mockTripsRepo.create.mock.calls.length).toBe(1)
  })

  it('deletes a trip and its itinerary', async () => {
    await tripService.deleteTrip('user-1', 'trip-1')
    expect(mockItineraryRepo.deleteAllByTrip.mock.calls.length).toBe(1)
    expect(mockTripsRepo.delete.mock.calls.length).toBe(1)
  })

  it('adds an itinerary item', async () => {
    const input = {
      name: 'Dinner',
      date: '2026-06-12',
      type: 'restaurant',
    }
    const item = await tripService.addItineraryItem('user-1', 'trip-1', input)
    expect(item.name).toBe('Dinner')
    expect(item.type).toBe('restaurant')
    expect(mockItineraryRepo.create.mock.calls.length).toBe(1)
  })

  it('removes an itinerary item', async () => {
    await tripService.removeItineraryItem('user-1', 'trip-1', 'item-1')
    expect(mockItineraryRepo.delete.mock.calls.length).toBe(1)
  })
})
