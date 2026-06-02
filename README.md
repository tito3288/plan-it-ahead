# PlanItAhead

PlanItAhead is a free web app for families planning U.S. National Park visits before they go. It will predict busy parking and entry windows by day and hour, then suggest an arrive-by time and simple daily plan.

Tagline: **Know before you go.**

This repository is currently Phase 1 only: project foundation, tooling, design system, Supabase wiring, and a deployable skeleton. It intentionally does not include park data, forecasts, auth flows, cron jobs, or business features yet.

## Tech Stack

- Next.js 14 App Router
- TypeScript strict mode
- Tailwind CSS
- Supabase Postgres/Auth via `@supabase/supabase-js` and `@supabase/ssr`
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

For this phase, placeholder or empty env values are enough for local build checks. Add real values when Supabase, NPS, RIDB, and cron integrations are introduced.

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
  sources/
  supabase/
types/
```
