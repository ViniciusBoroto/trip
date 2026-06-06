import { describe, it, expect } from 'bun:test'
import { parseCreateTripInput, parseCreateItineraryItemInput } from '../../../application/trip/trip-input'
import { InvalidTripInputError } from '../../../domain/trip/errors'

describe('Trip validations', () => {
  describe('parseCreateTripInput', () => {
    it('parses valid input', () => {
      const input = {
        name: 'Summer Trip',
        startDate: '2026-06-10',
        endDate: '2026-06-20',
        category: 'beach',
      }
      const parsed = parseCreateTripInput(input)
      expect(parsed.name).toBe('Summer Trip')
      expect(parsed.startDate).toBe('2026-06-10')
      expect(parsed.endDate).toBe('2026-06-20')
      expect(parsed.category).toBe('beach')
    })

    it('throws on missing name', () => {
      const input = {
        startDate: '2026-06-10',
        endDate: '2026-06-20',
      }
      expect(() => parseCreateTripInput(input)).toThrow(InvalidTripInputError)
    })

    it('throws on empty name', () => {
      const input = {
        name: '  ',
        startDate: '2026-06-10',
        endDate: '2026-06-20',
      }
      expect(() => parseCreateTripInput(input)).toThrow(InvalidTripInputError)
    })
  })

  describe('parseCreateItineraryItemInput', () => {
    it('parses valid itinerary item input', () => {
      const input = {
        name: 'Lunch at Osteria',
        date: '2026-06-12',
        type: 'restaurant',
      }
      const parsed = parseCreateItineraryItemInput(input)
      expect(parsed.name).toBe('Lunch at Osteria')
      expect(parsed.date).toBe('2026-06-12')
      expect(parsed.type).toBe('restaurant')
    })

    it('throws on missing fields', () => {
      const input = {
        name: 'Hotel checkin',
      }
      expect(() => parseCreateItineraryItemInput(input)).toThrow(InvalidTripInputError)
    })
  })
})
