export type Trip = {
  id: string
  userId: string
  name: string
  startDate: string
  endDate: string
  photo: string | null
  category: string | null
  bookingReference: string | null
  description: string | null
  importantNotes: string | null
  createdAt: string
}

export type ItineraryItem = {
  id: string
  tripId: string
  name: string
  date: string
  type: string
  createdAt: string
}

export type PublicItineraryItem = {
  id: string
  name: string
  date: string
  type: string
}

export type PublicTrip = {
  id: string
  name: string
  startDate: string
  endDate: string
  photo: string | null
  category: string | null
  bookingReference: string | null
  description: string | null
  importantNotes: string | null
  itinerary: PublicItineraryItem[]
}
