# PlanItAhead

PlanItAhead is a free web app for families planning U.S. National Park visits before they go. It will predict busy parking and entry windows by day and hour, then suggest an arrive-by time and simple daily plan.

Tagline: **Know before you go.**

This repository is currently through Phase 2: project foundation plus the Supabase schema, RLS policies, typed database helpers, and launch park seed data. It intentionally does not include external data ingestion, forecast logic, auth screens, cron jobs, or planner UI yet.

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

Placeholder or empty env values are enough for local build checks. Add real Supabase values before running database commands against a project.

Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser/server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser/server | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Server-side privileged Supabase access for later phases |
| `NPS_API_KEY` | Server only | National Park Service API key for later data ingestion |
| `RIDB_API_KEY` | Server only | Recreation.gov RIDB API key for later data ingestion |
| `CRON_SECRET` | Server only | Shared secret for protected Railway Cron API routes later |

`lib/env.ts` validates the current environment with zod. Public env can be imported by browser-safe code; server-only values should be read through server modules only.

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

Phase 2 uses versioned Supabase SQL migrations:

```text
supabase/
  config.toml
  migrations/
    20260602170000_create_schema.sql
    20260602171000_seed_launch_parks.sql
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

## Schema Overview

Reference data, publicly readable through RLS:

- `parks`: curated launch parks and card metadata.
- `lots`: representative parking areas per park.
- `visitation_history`: 12 months x 7 day-of-week baseline rows per park.
- `daily_forecast`: generated forecast cache for later phases.
- `alerts`: NPS alert cache for later phases.

User data, owner-scoped through RLS:

- `profiles`: one row per Supabase Auth user, auto-created by trigger.
- `saved_trips`: saved park/date plans per user.

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
    'visitation_history',
    'daily_forecast',
    'alerts',
    'profiles',
    'saved_trips'
  );

select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

Reference tables have `SELECT` policies with `using (true)`. `profiles` and `saved_trips` policies are scoped to `auth.uid()`.

## Railway Deploy

1. Create a new Railway project from this repository.
2. Add a single Next.js service.
3. Configure environment variables from `.env.example`.
4. Use `npm install` as the install command.
5. Use `npm run build` as the build command.
6. Use `npm run start` as the start command.
7. Set the service port to Railway's injected `PORT`; Next.js reads it automatically through `npm run start`.

Railway Cron will be added in a later phase by hitting a protected API route with `CRON_SECRET`.

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
  queries/
  sources/
  supabase/
supabase/
  migrations/
types/
  database.ts
```
