```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiating `Hono`:

```ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

## Auth contract

Required Worker vars:

```txt
JWT_ACCESS_SECRET
REFRESH_TOKEN_PEPPER
JWT_ISSUER
JWT_AUDIENCE
APP_ORIGIN
```

Required D1 tables:

```sql
create table if not exists users (
  id text primary key,
  email text not null unique,
  name text not null,
  password_hash text not null,
  is_active integer not null default 1,
  created_at text not null default current_timestamp
);

create table if not exists refresh_tokens (
  id text primary key,
  user_id text not null,
  token_hash text not null unique,
  expires_at text not null,
  created_at text not null,
  revoked_at text,
  replaced_by_token_id text,
  last_used_at text,
  remember integer not null default 0,
  foreign key (user_id) references users(id)
);

create index if not exists idx_refresh_tokens_user_id on refresh_tokens(user_id);
create index if not exists idx_refresh_tokens_expires_at on refresh_tokens(expires_at);
```

Expected password hash format:

```txt
pbkdf2_sha256$<iterations>$<salt>$<hex digest>
```

Implemented endpoints:

```txt
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET /auth/me
```

Registration validation rules:

```txt
name: required
email: required, valid email
password: required, minimum 8 characters
```
