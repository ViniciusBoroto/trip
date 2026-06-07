# Trip

A Cloudflare-powered web application for managing trips and itineraries.

## Live Demo

- **Frontend**: https://trip.viniciusdosanjos63.workers.dev
- **API**: https://api.viniciusdosanjos63.workers.dev

## Stack

- **API**: Hono, Bun, TypeScript, Zod, Drizzle-ORM, Resend (for emails), D1 Cloudflare Database, deployed on Cloudflare Workers
- **Frontend**: React (NextJS), Bun, Tailwind, TablerUI, deployed on Cloudflare Workers

## Features
- **Auth with JWT. Storing refresh tokens on HTTPOnly Cookies**:
  Refresh tokens stored in Cookies to prevent XSS attacks and maintain long-lived sessions.
  Refresh tokens are also stored in a DB table 'refresh_tokens' for revocability and rotation.
  Users are stored with UUIDs and stored in the 'users' table. Password hashed with PBKDF2 and SHA-256.
  On Access token expiration, token is refreshed seamlessly.
- **OTP**:
  Users can sign in with OTP sent to their email.
  Emails are sent with Resend.
  Are stored in the 'email_otps' table, with code hashed, expired_at, used_at and created_at for revocability and multiple workers. (In real-world applications probably would store in Redis with TTL).
  On token used or new token created, all others are invalidated.
- **Trip and Itinerary Items full CRUD**:
  Added Update actions even though not asked in the specs.
  Itinerary specs defined Date but I used DateTime for tracking itinerary activities chronologically.
  Users cannot create past trips.
- **Mobile-first approach**:
  Designed with mobile-first approach, but is responsive and works on desktop as well.
- **Security**:
  CORS
  
- ### Probable next features and security improvements:
  - Email confirmation and Forgot your password.
  - Rate Limiting and OTP-specific rate-limiting.

## Architecture

- **Backend**:
  Not used a strict adaptation of Hexagonal or Clean Arch, but it's inspired by both and follows its core principles.
  All REST HTTP API related features reside in the /api folder (cookies, middlewares, routers). Routers just map HTTP input into business logic, and protect routes.
  Domain types are in /domain folders.
  All business logic and validation (used Zod here) are under /application folder (used services, not use cases). OBS: Auth-related validations are on /application/auth, I made this separation because auth is not specifically business logic, but to follow the project pattern. All external validations (including token generation and password hashing were abstracted to infra layer)
  All external calls or varying 3rd party usage were abstracted via interfaces (ports) and implemented on Infra layer (DB-calls (repositories), Resend, hashing alg, JWT signs).
- **Frontend**:
  Used NextJS routing system for page routing.
  Reusable components and forms were separated into /components folder either for re-usability or readability.
  API calls separated via service hooks on /services folder.
  Services used reusable API client from /lib/api, which handled the Seamless Auth token logic in a single point.
  Types stored on /types folder
  NotFound and Error pages.
- **DevOps**:
  D1 database migrated with wrangler.
  Hono API was built with CloudFlare native template, including Wrangler utility and connection. (CI working)
  NextJS needed CF Next adapter, and the CI is failing, so for current scope I simply deployed manually the frontend.