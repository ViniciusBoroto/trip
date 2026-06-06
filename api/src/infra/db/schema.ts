import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const usersTable = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
})

export const refreshTokensTable = sqliteTable('refresh_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
  revokedAt: text('revoked_at'),
  replacedByTokenId: text('replaced_by_token_id'),
  lastUsedAt: text('last_used_at'),
  remember: integer('remember', { mode: 'boolean' }).notNull().default(false),
})

export const tripsTable = sqliteTable('trips', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  photo: text('photo'),
  category: text('category'),
  bookingReference: text('booking_reference'),
  description: text('description'),
  importantNotes: text('important_notes'),
  createdAt: text('created_at').notNull(),
})

export const itineraryItemsTable = sqliteTable('itinerary_items', {
  id: text('id').primaryKey(),
  tripId: text('trip_id').notNull(),
  name: text('name').notNull(),
  date: text('date').notNull(),
  type: text('type').notNull(),
  createdAt: text('created_at').notNull(),
})

export type UserRow = typeof usersTable.$inferSelect
export type RefreshTokenRow = typeof refreshTokensTable.$inferSelect
export type TripRow = typeof tripsTable.$inferSelect
export type ItineraryItemRow = typeof itineraryItemsTable.$inferSelect

