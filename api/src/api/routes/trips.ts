import { Hono } from 'hono'
import type { Context } from 'hono'

import type { TripService } from '../../application/trip/trip-service'
import type { AppBindings } from '../../di/bindings'
import {
  TripNotFoundError,
  TripAccessDeniedError,
  ItineraryItemNotFoundError,
  InvalidTripInputError,
} from '../../domain/trip/errors'
import { createAuthMiddleware, type AuthenticatedAppEnv } from '../middleware'
import type { AuthService } from '../../application/auth/auth-service'

export function createTripRoutes(
  getTripService: (bindings: AppBindings) => TripService,
  getAuthService: (bindings: AppBindings) => AuthService
) {
  const router = new Hono<AuthenticatedAppEnv>()

  // Apply auth middleware to all trip routes
  router.use('*', createAuthMiddleware(getAuthService))

  // GET /trips - List all trips of the authenticated user
  router.get('/', async (c) => {
    try {
      const claims = c.get('auth')
      const { search, category, page, pageSize } = c.req.query()
      const result = await getTripService(c.env).listTrips(claims.sub, {
        search,
        category,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      })
      return c.json({ ok: true, ...result })
    } catch (error) {
      return handleTripError(c, error)
    }
  })

  // POST /trips - Create a new trip
  router.post('/', async (c) => {
    try {
      const claims = c.get('auth')
      const body = await c.req.json().catch(() => null)
      const trip = await getTripService(c.env).createTrip(claims.sub, body)
      return c.json({ ok: true, message: 'Trip created.', trip }, 201)
    } catch (error) {
      return handleTripError(c, error)
    }
  })

  // GET /trips/:tripId - View specific trip detail & itinerary items
  router.get('/:tripId', async (c) => {
    try {
      const claims = c.get('auth')
      const tripId = c.req.param('tripId')
      const trip = await getTripService(c.env).getTrip(claims.sub, tripId)
      return c.json({ ok: true, trip })
    } catch (error) {
      return handleTripError(c, error)
    }
  })

  // PUT /trips/:tripId - Update a trip
  router.put('/:tripId', async (c) => {
    try {
      const claims = c.get('auth')
      const tripId = c.req.param('tripId')
      const body = await c.req.json().catch(() => null)
      const trip = await getTripService(c.env).updateTrip(claims.sub, tripId, body)
      return c.json({ ok: true, message: 'Trip updated.', trip })
    } catch (error) {
      return handleTripError(c, error)
    }
  })

  // DELETE /trips/:tripId - Delete a trip
  router.delete('/:tripId', async (c) => {
    try {
      const claims = c.get('auth')
      const tripId = c.req.param('tripId')
      await getTripService(c.env).deleteTrip(claims.sub, tripId)
      return c.json({ ok: true, message: 'Trip deleted.' })
    } catch (error) {
      return handleTripError(c, error)
    }
  })

  // POST /trips/:tripId/items - Add itinerary item
  router.post('/:tripId/items', async (c) => {
    try {
      const claims = c.get('auth')
      const tripId = c.req.param('tripId')
      const body = await c.req.json().catch(() => null)
      const item = await getTripService(c.env).addItineraryItem(claims.sub, tripId, body)
      return c.json({ ok: true, message: 'Itinerary item added.', item }, 201)
    } catch (error) {
      return handleTripError(c, error)
    }
  })

  // PUT /trips/:tripId/items/:itemId - Update itinerary item
  router.put('/:tripId/items/:itemId', async (c) => {
    try {
      const claims = c.get('auth')
      const tripId = c.req.param('tripId')
      const itemId = c.req.param('itemId')
      const body = await c.req.json().catch(() => null)
      const item = await getTripService(c.env).updateItineraryItem(claims.sub, tripId, itemId, body)
      return c.json({ ok: true, message: 'Itinerary item updated.', item })
    } catch (error) {
      return handleTripError(c, error)
    }
  })

  // DELETE /trips/:tripId/items/:itemId - Remove itinerary item
  router.delete('/:tripId/items/:itemId', async (c) => {
    try {
      const claims = c.get('auth')
      const tripId = c.req.param('tripId')
      const itemId = c.req.param('itemId')
      await getTripService(c.env).removeItineraryItem(claims.sub, tripId, itemId)
      return c.json({ ok: true, message: 'Itinerary item removed.' })
    } catch (error) {
      return handleTripError(c, error)
    }
  })

  return router
}

function handleTripError<E extends { Bindings: AppBindings }>(c: Context<E>, error: unknown) {
  if (error instanceof InvalidTripInputError) {
    return c.json({ ok: false, message: error.message }, 400)
  }

  if (error instanceof TripNotFoundError) {
    return c.json({ ok: false, message: error.message }, 404)
  }

  if (error instanceof ItineraryItemNotFoundError) {
    return c.json({ ok: false, message: error.message }, 404)
  }

  if (error instanceof TripAccessDeniedError) {
    return c.json({ ok: false, message: error.message }, 403)
  }

  console.error(error)
  return c.json({ ok: false, message: 'Operation failed.' }, 500)
}
