export class TripNotFoundError extends Error {
  constructor() {
    super('Trip not found.')
    this.name = 'TripNotFoundError'
  }
}

export class ItineraryItemNotFoundError extends Error {
  constructor() {
    super('Itinerary item not found.')
    this.name = 'ItineraryItemNotFoundError'
  }
}

export class TripAccessDeniedError extends Error {
  constructor() {
    super('Access denied for this trip.')
    this.name = 'TripAccessDeniedError'
  }
}

export class InvalidTripInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidTripInputError'
  }
}
