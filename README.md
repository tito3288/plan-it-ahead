# PlanItAhead

PlanItAhead is a free web app for families planning U.S. National Park visits before they go. It will predict busy parking and entry windows by day and hour, then suggest an arrive-by time and simple daily plan.

Tagline: **Know before you go.**

This repository is currently through Phase 8: project foundation, Supabase schema, RLS policies, typed database helpers, launch park seed data, server-side data ingestion, deterministic forecasts, the planning flow, the forecast page, Supabase Auth, saved trips, and production deployment configuration. It intentionally keeps post-v1 hardening such as separate staging/prod Supabase projects out of scope.

## Tech Stack

- Next.js 14 App Router
- TypeScript strict mode
- Tailwind CSS
- Supabase Postgres/Auth via `@supabase/supabase-js` and `@supabase/ssr`
- Supabase CLI migrations in `supabase/migrations`
- lucide-react icons
- date-fns
- zod env validation
- ESLint and Prettier with Tailwind class sorting
- Railway single-service deploy target

## Getting Started

Install dependencies:

```bash
npm install
```

Copy env values:

```bash
cp .env.example .env.local
```

Placeholder or empty env values are enough for local build checks. Add real Supabase and data-source values before running database or ingestion commands.

Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable                        | Scope          | Purpose                                                               |
| ------------------------------- | -------------- | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Browser/server | Supabase project URL                                                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser/server | Supabase anonymous key                                                |
| `NEXT_PUBLIC_SITE_URL`          | Browser/server | Canonical site URL for auth redirects; `http://localhost:3000` in dev |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server only    | Privileged Supabase writes for ingestion; never expose to client code |
| `NPS_API_KEY`                   | Server only    | Free National Park Service API key from developer.nps.gov             |
| `RIDB_API_KEY`                  | Server only    | Free Recreation.gov RIDB key from ridb.recreation.gov/profile         |
| `CRON_SECRET`                   | Server only    | Long random string required by `/api/cron/refresh`                    |

`lib/env.ts` validates the current environment with zod. Public env can be imported by browser-safe code; server-only values should be read through server modules only.

## Auth and Saved Trips

PlanItAhead uses Supabase Auth through `@supabase/ssr`. Email + password is
the primary sign-in method, and passwordless magic links remain available as a
secondary option.

Routes:

- `/login`: sign in with email + password, create an account, or request a
  magic link.
- `/auth/callback`: exchanges confirmation and magic-link codes for a
  cookie-based session.
- `/auth/forgot`: requests a password reset email.
- `/auth/reset`: handles the reset email link and lets the user set a new
  password.
- `/auth/signout`: clears the Supabase session and returns home.
- `/trips`: authenticated saved-trip list with delete actions.

The App Router session is refreshed by `middleware.ts`. User data access uses the authenticated Supabase client, so `saved_trips` RLS policies enforce that users can only read, create, update, or delete their own rows. The service-role client is reserved for ingestion and forecast generation only.

Supabase Auth settings:

1. Authentication -> Sign In / Providers -> Email: ensure Email/password is
   enabled.
2. Keep Confirm email on for production so first-time signups must verify their
   email before using the account.
3. Authentication -> URL Configuration -> Redirect URLs allowlist:
   - `https://planitahead.com/auth/callback`
   - `https://planitahead.com/auth/reset`
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/reset`

Local auth testing:

1. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
2. In Supabase Auth settings, include `http://localhost:3000` as the Site URL or redirect allowlist entry.
3. Run `npm run dev`, open `/login`, and test both email + password and the
   secondary magic-link option.
4. If email delivery is slow or blocked during testing, check Supabase Auth email rate limits before debugging app code.

Production email note: Supabase default auth emails are fine for testing but rate-limited. At deploy time, configure custom SMTP in Supabase Auth settings. The owner plans to use Resend SMTP.

Production redirect note: Supabase Auth redirect allowlists must include localhost
for development and the production domain, including
`https://planitahead.com/auth/callback` and
`https://planitahead.com/auth/reset` when the site is deployed.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run format
npm run db:start
npm run db:link
npm run db:migrate
npm run db:reset
npm run db:types
npm run forecast
npm run ingest
npm run test
```

Health check:

```bash
curl http://localhost:3000/api/health
```

Expected shape:

```json
{
  "status": "ok",
  "time": "2026-06-02T00:00:00.000Z"
}
```

## Database Workflow

The database uses versioned Supabase SQL migrations:

```text
supabase/
  config.toml
  migrations/
    20260602170000_create_schema.sql
    20260602171000_seed_launch_parks.sql
    20260603110000_add_weather_cache.sql
types/
  database.ts
```

Link a hosted Supabase project:

```bash
npm run db:link
```

Apply migrations and seed data to the linked project:

```bash
npm run db:migrate
```

Start and reset a local Supabase stack, if Docker is available:

```bash
npm run db:start
npm run db:reset
```

Regenerate TypeScript database types after schema changes:

```bash
npm run db:types
```

`types/database.ts` is committed so query helpers compile even before a local Supabase stack is running.

Some networks block the Supabase Postgres connection used by `db:migrate`. If that happens, run the migration SQL in the Supabase SQL Editor, then regenerate types with:

```bash
supabase gen types typescript --project-id krhtcphqjeinglrbkqby > types/database.ts
```

## Schema Overview

Reference data, publicly readable through RLS:

- `parks`: curated launch parks and card metadata.
- `lots`: representative parking areas per park.
- `park_highlights`: curated hikes, viewpoints, and landmarks per park.
- `park_stay_options`: curated gateway, lodging, and campground bases per park.
- `visitation_history`: 12 months x 7 day-of-week baseline rows per park.
- `daily_forecast`: generated forecast cache for later phases.
- `alerts`: NPS alert cache for later phases.
- `weather_cache`: Open-Meteo daily weather cache for later phases.

User data, owner-scoped through RLS:

- `profiles`: one row per Supabase Auth user, auto-created by trigger.
- `saved_trips`: saved park/date plans per user.
- `itineraries`: multi-day travel plans per user.
- `itinerary_items`: saved park plans and notes within an itinerary.

The seed migration creates:

- 8 active launch parks.
- 24 lots, 3 per park.
- 672 visitation history rows, 84 per park.

Quick verification queries:

```sql
select count(*) from public.parks where is_active;
select park_id, count(*) from public.lots group by park_id;
select park_id, count(*) from public.visitation_history group by park_id;
```

RLS verification:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'parks',
    'lots',
    'park_highlights',
    'park_stay_options',
    'visitation_history',
    'daily_forecast',
    'alerts',
    'weather_cache',
    'profiles',
    'saved_trips',
    'itineraries',
    'itinerary_items'
  );

select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

Reference tables have `SELECT` policies with `using (true)`. `profiles` and `saved_trips` policies are scoped to `auth.uid()`.

## Data Ingestion

Phase 3 caches official/free data sources for later forecast generation:

- NPS Data API alerts via `lib/sources/nps.ts`.
- Recreation.gov RIDB facility candidates via `lib/sources/recreation.ts`.
- Open-Meteo weather via `lib/sources/weather.ts`.

The ingestion pipeline writes through the server-only Supabase admin client in `lib/supabase/admin.ts`. This client requires `SUPABASE_SERVICE_ROLE_KEY` and throws if used in a browser context.

Run ingestion locally:

```bash
npm run ingest
```

Expected effects:

- Upserts current NPS alerts into `alerts` and removes stale alerts per park.
- Updates `parks.ridb_facility_ids` with best-effort RIDB matches.
- Upserts 10 days of Open-Meteo daily data into `weather_cache`.

The command prints a structured summary:

```json
{
  "alerts": { "parks": 8, "received": 0, "upserted": 0, "deleted": 0 },
  "facilities": { "parks": 8, "updated": 8, "noMatches": [] },
  "weather": { "parks": 8, "days": 10, "upserted": 80 },
  "errors": []
}
```

The syncs are idempotent, so rerunning should not create duplicate alerts or weather rows.

## Cron Refresh

The refresh endpoint supports `GET` for manual testing and `POST` for schedulers:

```text
GET or POST /api/cron/refresh
Authorization: Bearer <CRON_SECRET>
```

Manual test:

```bash
curl -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://<app-url>/api/cron/refresh
```

Unauthorized requests return `401`.

Scheduling options:

- Railway Cron, preferred: schedule an HTTP POST to `https://<app-url>/api/cron/refresh` with `Authorization: Bearer <CRON_SECRET>`. Recommended cadence: daily at `0 9 * * *`, with an optional alerts-only cadence later every few hours after Phase 4 splits refresh modes.
- cron-job.org: create a scheduled HTTPS POST to the same endpoint with the same authorization header and daily cadence.

Do not wire live scheduling until deployment hardening in Phase 8.

## Forecast Engine

Phase 4 writes deterministic, explainable forecasts into `daily_forecast`. The engine reads `visitation_history`, `weather_cache`, `parks`, `lots`, and `alerts`, then writes a 14-day rolling window for every active park.

Core forecast code lives in `lib/forecast/`:

- `config.ts`: all tunable thresholds, multipliers, weather weights, hourly curve, confidence rules, and arrive-by buffers.
- `busyness.ts`: normalized daily score from historical busyness, weekend/holiday effects, and weather.
- `curve.ts`: 14-slot green/amber/red hourly status curve for 6 AM through 7 PM.
- `lots.ts`: per-lot arrive-by guidance.
- `plan.ts`: templated headline and daily plan language.
- `confidence.ts`: conservative high/medium/low confidence.
- `generate.ts`: database orchestration and idempotent `daily_forecast` upserts.

Run forecast generation locally:

```bash
npm run forecast
```

Expected result after Phase 2 seed data:

- 8 active parks.
- 14 dates per park.
- 112 `daily_forecast` rows.
- No duplicate rows on rerun.

Run unit tests:

```bash
npm run test
```

The protected refresh endpoint now runs ingestion first, then forecast generation. Its JSON response contains both stages:

```json
{
  "ingestion": {
    "alerts": {},
    "facilities": {},
    "weather": {},
    "errors": []
  },
  "forecast": {
    "parks": 8,
    "rows": 112,
    "windowDays": 14,
    "confidence": {
      "high": 70,
      "medium": 22,
      "low": 20
    },
    "errors": []
  },
  "errors": []
}
```

## Railway Deploy

The repo includes `railway.json` for Nixpacks:

- Build command: `npm run build`
- Start command: `npm run start`
- Health check path: `/api/health`
- Node target: `20.x` in `package.json`

`next start` respects Railway's injected `PORT`; do not hardcode port `3000` in production.

### 1. Create the Railway service

1. Railway -> New Project -> Deploy from GitHub repo.
2. Select `tito3288/plan-it-ahead`.
3. Set the service to deploy from the `main` branch.
4. Railway should detect Next.js through Nixpacks and use `railway.json`.

The first deploy may fail or run without full runtime behavior until variables are added.

### 2. Add Railway variables

In the Railway service Variables tab, add:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=https://planitahead.com
SUPABASE_SERVICE_ROLE_KEY=
NPS_API_KEY=
RIDB_API_KEY=
CRON_SECRET=
```

Notes:

- `SUPABASE_SERVICE_ROLE_KEY` must be the server-only `sb_secret_...` key. Never commit it and never prefix it with `NEXT_PUBLIC_`.
- `CRON_SECRET` should be a long random string and must match the cron-job.org Authorization header.
- This app uses one Supabase project for v1: project ref `krhtcphqjeinglrbkqby`.

Redeploy after adding variables. Then verify:

```bash
curl https://<railway-url>/api/health
```

Expected response includes `"status":"ok"`.

### 3. Connect `planitahead.com`

1. Railway service -> Settings -> Networking -> Custom Domain.
2. Add `planitahead.com`. Add `www.planitahead.com` too if desired.
3. Railway will provide a DNS target.
4. In Cloudflare DNS, add the record Railway specifies. For the apex domain, use the CNAME/flattening setup Railway recommends.
5. Set the record to DNS only initially while Railway verifies it. Proxying can be enabled after TLS is active.
6. Wait for Railway to show the domain as Active, then test `https://planitahead.com`.

### 4. Configure Supabase Auth URLs

Supabase dashboard -> Authentication -> URL Configuration:

1. Site URL: `https://planitahead.com`
2. Redirect URLs allowlist:
   - `https://planitahead.com/auth/callback`
   - `https://planitahead.com/auth/reset`
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/reset`

Auth redirects use `NEXT_PUBLIC_SITE_URL`, so keep Railway set to
`https://planitahead.com` and local `.env.local` set to
`http://localhost:3000`.

### 5. Configure Resend SMTP for auth email

Supabase's default auth emails are rate-limited. For production, use Resend SMTP:

1. In Resend, verify a sending domain, for example `planitahead.com` or a mail subdomain.
2. Create or copy SMTP credentials.
3. Supabase dashboard -> Authentication -> Emails -> SMTP Settings.
4. Enable custom SMTP and enter:
   - Host: `smtp.resend.com`
   - Port: `465` or `587`
   - Username: `resend`
   - Password: the Resend API key
   - Sender: for example `no-reply@planitahead.com`
5. Send a production magic link to confirm delivery.

### 6. Wire cron-job.org

Create a cron job:

- URL: `https://planitahead.com/api/cron/refresh`
- Method: `POST`
- Header: `Authorization: Bearer <CRON_SECRET>`
- Schedule: daily at a low-traffic hour, such as 9:00 AM. Optionally add a second alerts-focused cadence later.

Run it once manually and confirm:

- HTTP `200`
- JSON summary includes ingestion and forecast results
- Railway logs show `[cron.refresh] Starting...` and `[cron.refresh] Completed...`
- Supabase `daily_forecast`, `alerts`, and `weather_cache` update as expected

Unauthorized requests should return `401`.

Manual local/prod test:

```bash
curl -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://planitahead.com/api/cron/refresh
```

## Phase Roadmap

1. Foundation: scaffold, tooling, design system, Supabase clients, health route.
2. Schema: database tables, RLS policies, and migrations.
3. Data ingestion: official source helpers and cache schedule structure.
4. Forecast engine: rules-based crowd and parking forecast logic.
5. Guided planning flow: park picker, date picker, and trip draft state.
6. Forecast page: daily/hourly forecast, arrive-by recommendation, and simple plan.
7. Save trips and auth: Supabase Auth, saved plans, and account flows.
8. Deployment hardening: cron wiring, observability, production QA, and launch polish.

## Current Structure

```text
app/
  api/health/route.ts
  globals.css
  layout.tsx
  page.tsx
components/ui/
lib/
  forecast/
  ingest/
  queries/
  sources/
  supabase/
supabase/
  migrations/
types/
  database.ts
```
