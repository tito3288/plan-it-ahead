create table public.weather_cache (
  id uuid primary key default gen_random_uuid(),
  park_id uuid not null references public.parks(id) on delete cascade,
  forecast_date date not null,
  summary text not null,
  temp_high numeric,
  temp_low numeric,
  precip_chance int check (
    precip_chance is null
    or precip_chance between 0 and 100
  ),
  weather_code int,
  raw jsonb,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (park_id, forecast_date)
);

create index weather_cache_park_date_idx
on public.weather_cache (park_id, forecast_date);

create trigger weather_cache_set_updated_at
before update on public.weather_cache
for each row execute function public.set_updated_at();

alter table public.weather_cache enable row level security;

create policy "Weather cache is publicly readable"
on public.weather_cache for select
using (true);

alter table public.alerts
add constraint alerts_park_nps_alert_id_key unique (park_id, nps_alert_id);
