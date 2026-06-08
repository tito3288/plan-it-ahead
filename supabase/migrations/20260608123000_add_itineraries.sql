create table public.itineraries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  start_date date not null,
  end_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid not null references public.itineraries(id) on delete cascade,
  item_date date not null,
  item_type text not null check (item_type in ('saved_trip', 'note')),
  saved_trip_id uuid references public.saved_trips(id) on delete cascade,
  title text,
  notes text,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (
      item_type = 'saved_trip'
      and saved_trip_id is not null
    )
    or (
      item_type = 'note'
      and title is not null
    )
  )
);

create index itineraries_user_dates_idx
on public.itineraries (user_id, start_date, end_date);

create index itinerary_items_itinerary_date_order_idx
on public.itinerary_items (itinerary_id, item_date, display_order, created_at);

create index itinerary_items_saved_trip_idx
on public.itinerary_items (saved_trip_id);

create trigger itineraries_set_updated_at
before update on public.itineraries
for each row execute function public.set_updated_at();

create trigger itinerary_items_set_updated_at
before update on public.itinerary_items
for each row execute function public.set_updated_at();

alter table public.itineraries enable row level security;
alter table public.itinerary_items enable row level security;

create policy "Users can read their itineraries"
on public.itineraries for select
using (auth.uid() = user_id);

create policy "Users can create their itineraries"
on public.itineraries for insert
with check (auth.uid() = user_id);

create policy "Users can update their itineraries"
on public.itineraries for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their itineraries"
on public.itineraries for delete
using (auth.uid() = user_id);

create policy "Users can read their itinerary items"
on public.itinerary_items for select
using (
  exists (
    select 1
    from public.itineraries
    where itineraries.id = itinerary_items.itinerary_id
      and itineraries.user_id = auth.uid()
  )
);

create policy "Users can create their itinerary items"
on public.itinerary_items for insert
with check (
  exists (
    select 1
    from public.itineraries
    where itineraries.id = itinerary_items.itinerary_id
      and itineraries.user_id = auth.uid()
      and itinerary_items.item_date between itineraries.start_date and itineraries.end_date
  )
  and (
    itinerary_items.saved_trip_id is null
    or exists (
      select 1
      from public.saved_trips
      where saved_trips.id = itinerary_items.saved_trip_id
        and saved_trips.user_id = auth.uid()
    )
  )
);

create policy "Users can delete their itinerary items"
on public.itinerary_items for delete
using (
  exists (
    select 1
    from public.itineraries
    where itineraries.id = itinerary_items.itinerary_id
      and itineraries.user_id = auth.uid()
  )
);
