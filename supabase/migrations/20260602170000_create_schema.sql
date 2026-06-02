create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.parks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  full_name text not null,
  state text not null,
  nps_park_code text not null,
  ridb_facility_ids text[],
  latitude numeric not null,
  longitude numeric not null,
  timezone text not null,
  data_tier int not null check (data_tier in (1, 2, 3)),
  requires_reservation boolean not null default false,
  reservation_note text,
  gradient text not null,
  blurb text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lots (
  id uuid primary key default gen_random_uuid(),
  park_id uuid not null references public.parks(id) on delete cascade,
  name text not null,
  note text,
  typical_fill_hour int check (
    typical_fill_hour is null
    or typical_fill_hour between 0 and 23
  ),
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.visitation_history (
  id uuid primary key default gen_random_uuid(),
  park_id uuid not null references public.parks(id) on delete cascade,
  month int not null check (month between 1 and 12),
  dow int not null check (dow between 0 and 6),
  relative_busyness numeric not null check (
    relative_busyness >= 0
    and relative_busyness <= 1
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (park_id, month, dow)
);

create table public.daily_forecast (
  id uuid primary key default gen_random_uuid(),
  park_id uuid not null references public.parks(id) on delete cascade,
  forecast_date date not null,
  hourly_status int[] not null check (
    cardinality(hourly_status) = 14
    and 0 <= all(hourly_status)
    and 2 >= all(hourly_status)
  ),
  headline text,
  lot_predictions jsonb not null default '[]'::jsonb,
  daily_plan jsonb,
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  weather_summary text,
  source text not null check (source in ('prediction', 'live', 'mixed')),
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (park_id, forecast_date)
);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  park_id uuid not null references public.parks(id) on delete cascade,
  category text not null,
  title text not null,
  description text,
  url text,
  nps_alert_id text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.saved_trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  park_id uuid not null references public.parks(id) on delete cascade,
  start_date date not null,
  end_date date,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

create index parks_active_name_idx on public.parks (is_active, name);
create index parks_nps_park_code_idx on public.parks (nps_park_code);
create index lots_park_id_idx on public.lots (park_id);
create index visitation_history_park_id_idx on public.visitation_history (park_id);
create index daily_forecast_park_id_idx on public.daily_forecast (park_id);
create index daily_forecast_park_date_idx on public.daily_forecast (park_id, forecast_date);
create index alerts_park_id_idx on public.alerts (park_id);
create index alerts_nps_alert_id_idx on public.alerts (nps_alert_id);
create index profiles_updated_at_idx on public.profiles (updated_at);
create index saved_trips_user_id_idx on public.saved_trips (user_id);
create index saved_trips_park_id_idx on public.saved_trips (park_id);
create index saved_trips_user_dates_idx on public.saved_trips (user_id, start_date, end_date);

create trigger parks_set_updated_at
before update on public.parks
for each row execute function public.set_updated_at();

create trigger lots_set_updated_at
before update on public.lots
for each row execute function public.set_updated_at();

create trigger visitation_history_set_updated_at
before update on public.visitation_history
for each row execute function public.set_updated_at();

create trigger daily_forecast_set_updated_at
before update on public.daily_forecast
for each row execute function public.set_updated_at();

create trigger alerts_set_updated_at
before update on public.alerts
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger saved_trips_set_updated_at
before update on public.saved_trips
for each row execute function public.set_updated_at();

alter table public.parks enable row level security;
alter table public.lots enable row level security;
alter table public.visitation_history enable row level security;
alter table public.daily_forecast enable row level security;
alter table public.alerts enable row level security;
alter table public.profiles enable row level security;
alter table public.saved_trips enable row level security;

create policy "Parks are publicly readable"
on public.parks for select
using (true);

create policy "Lots are publicly readable"
on public.lots for select
using (true);

create policy "Visitation history is publicly readable"
on public.visitation_history for select
using (true);

create policy "Daily forecasts are publicly readable"
on public.daily_forecast for select
using (true);

create policy "Alerts are publicly readable"
on public.alerts for select
using (true);

create policy "Users can read their profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can insert their profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Users can update their profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can read their saved trips"
on public.saved_trips for select
using (auth.uid() = user_id);

create policy "Users can create their saved trips"
on public.saved_trips for insert
with check (auth.uid() = user_id);

create policy "Users can update their saved trips"
on public.saved_trips for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their saved trips"
on public.saved_trips for delete
using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
