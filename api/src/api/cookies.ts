import type { Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'

import type { AppBindings } from '../di/bindings'

export const REFRESH_TOKEN_COOKIE = 'trip_refresh_token'

type CookieContext<E extends { Bindings: AppBindings }> = Context<E>

export function readRefreshToken<E extends { Bindings: AppBindings }>(c: CookieContext<E>) {
  return getCookie(c, REFRESH_TOKEN_COOKIE) ?? null
}

export function writeRefreshToken<E extends { Bindings: AppBindings }>(
  c: CookieContext<E>,
  refreshToken: string,
  expiresAt: string,
) {
  setCookie(c, REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: new URL(c.req.url).protocol === 'https:',
    sameSite: 'Lax',
    path: '/',
    expires: new Date(expiresAt),
  })
}

export function clearRefreshToken<E extends { Bindings: AppBindings }>(c: CookieContext<E>) {
  deleteCookie(c, REFRESH_TOKEN_COOKIE, {
    path: '/',
  })
}
