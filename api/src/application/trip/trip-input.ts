import { z } from 'zod'
import { InvalidTripInputError } from '../../domain/trip/errors'

export type CreateTripInput = {
  name: string
  startDate: string
  endDate: string
  photo?: string | null
  category?: string | null
  bookingReference?: string | null
  description?: string | null
  importantNotes?: string | null
}

export type CreateItineraryItemInput = {
  name: string
  date: string
  type: string
}

const createTripSchema = z.object({
  name: z.string().trim().min(1, 'Trip name is required.'),
  startDate: z.string().trim().min(1, 'Start date is required.'),
  endDate: z.string().trim().min(1, 'End date is required.'),
  photo: z.string().trim().nullish(),
  category: z.string().trim().nullish(),
  bookingReference: z.string().trim().nullish(),
  description: z.string().trim().nullish(),
  importantNotes: z.string().trim().nullish(),
})

const createItineraryItemSchema = z.object({
  name: z.string().trim().min(1, 'Itinerary item name is required.'),
  date: z.string().trim().min(1, 'Date is required.'),
  type: z.string().trim().min(1, 'Type is required.'),
})

export function parseCreateTripInput(input: unknown): CreateTripInput {
  const result = createTripSchema.safeParse(input)
  if (!result.success) {
    throw new InvalidTripInputError(result.error.issues[0]?.message ?? 'Invalid trip input.')
  }
  return result.data
}

export function parseCreateItineraryItemInput(input: unknown): CreateItineraryItemInput {
  const result = createItineraryItemSchema.safeParse(input)
  if (!result.success) {
    throw new InvalidTripInputError(result.error.issues[0]?.message ?? 'Invalid itinerary item input.')
  }
  return result.data
}
