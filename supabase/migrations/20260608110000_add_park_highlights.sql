create table public.park_highlights (
  id uuid primary key default gen_random_uuid(),
  park_id uuid not null references public.parks(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('hike', 'landmark', 'viewpoint')),
  area text not null,
  timing_label text not null check (
    timing_label in (
      'Do early',
      'Good backup',
      'Anytime stop',
      'Reservation-aware'
    )
  ),
  planning_note text not null,
  source_url text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (park_id, name)
);

create index park_highlights_park_active_order_idx
on public.park_highlights (park_id, is_active, display_order, name);

create trigger park_highlights_set_updated_at
before update on public.park_highlights
for each row execute function public.set_updated_at();

alter table public.park_highlights enable row level security;

create policy "Park highlights are publicly readable"
on public.park_highlights for select
using (true);

with launch_highlights as (
  select *
  from (
    values
      (
        'yosemite',
        'Mist Trail',
        'hike',
        'Yosemite Valley',
        'Do early',
        'Start from Happy Isles before the Valley shuttle and trail corridor get crowded.',
        'https://www.nps.gov/yose/planyourvisit/vernalnevadatrail.htm',
        1
      ),
      (
        'yosemite',
        'Mirror Lake',
        'hike',
        'Yosemite Valley',
        'Good backup',
        'A flexible Valley stop that pairs well with shuttle access near Curry Village.',
        'https://www.nps.gov/yose/planyourvisit/mirrorlaketrail.htm',
        2
      ),
      (
        'yosemite',
        'Mariposa Grove',
        'landmark',
        'Wawona',
        'Do early',
        'Give this south-park giant sequoia stop its own travel buffer and watch shuttle timing.',
        'https://www.nps.gov/yose/planyourvisit/mg.htm',
        3
      ),
      (
        'yosemite',
        'Tunnel View',
        'viewpoint',
        'Wawona Road',
        'Anytime stop',
        'A short scenic pullout that works well as an arrival or exit stop when traffic allows.',
        'https://www.nps.gov/yose/learn/nature/scenic-vistas-tunnel-view.htm',
        4
      ),
      (
        'rocky-mountain',
        'Bear Lake',
        'landmark',
        'Bear Lake Road',
        'Reservation-aware',
        'Use the Bear Lake Corridor timing rules and expect early parking pressure.',
        'https://www.nps.gov/thingstodo/hike-around-bear-lake.htm',
        1
      ),
      (
        'rocky-mountain',
        'Emerald Lake Trail',
        'hike',
        'Bear Lake Road',
        'Do early',
        'Start early from Bear Lake Trailhead and aim to be below exposed areas before storms build.',
        'https://www.nps.gov/thingstodo/romo_emeraldlake.htm',
        2
      ),
      (
        'rocky-mountain',
        'Alberta Falls',
        'hike',
        'Glacier Gorge',
        'Good backup',
        'A shorter Bear Lake Corridor hike that still benefits from morning shuttle or parking plans.',
        null,
        3
      ),
      (
        'rocky-mountain',
        'Alpine Visitor Center',
        'landmark',
        'Trail Ridge Road',
        'Anytime stop',
        'A high-elevation road stop where weather and seasonal road status can change plans quickly.',
        'https://www.nps.gov/romo/planyourvisit/visitorcenters.htm',
        4
      ),
      (
        'zion',
        'The Narrows',
        'hike',
        'Zion Canyon',
        'Do early',
        'Check river and flash-flood conditions before committing to this water hike.',
        'https://www.nps.gov/thingstodo/hike-the-narrows.htm',
        1
      ),
      (
        'zion',
        'Angels Landing',
        'hike',
        'Zion Canyon',
        'Reservation-aware',
        'Permit rules apply beyond Scout Lookout; plan the shuttle and lottery timing carefully.',
        'https://www.nps.gov/thingstodo/hike-angels-landing.htm',
        2
      ),
      (
        'zion',
        'Emerald Pools',
        'hike',
        'Zion Canyon',
        'Good backup',
        'A flexible canyon hike with several route options near Zion Lodge and The Grotto.',
        'https://www.nps.gov/thingstodo/hike-upper-emerald-pools.htm',
        3
      ),
      (
        'zion',
        'Canyon Overlook Trail',
        'viewpoint',
        'East Side',
        'Do early',
        'Parking is very limited near the tunnel, so treat this as an early or patient stop.',
        'https://www.nps.gov/thingstodo/hike-canyon-overlook.htm',
        4
      ),
      (
        'acadia',
        'Cadillac Mountain Summit',
        'viewpoint',
        'Cadillac Summit Road',
        'Reservation-aware',
        'Sunrise is the busiest window and vehicle reservations may be required in season.',
        'https://www.nps.gov/acad/planyourvisit/cadillac-mountain.htm',
        1
      ),
      (
        'acadia',
        'Jordan Pond Path',
        'hike',
        'Jordan Pond',
        'Do early',
        'Arrive early for the compact parking area and leave room for slower boardwalk sections.',
        'https://www.nps.gov/thingstodo/hike-jordan-pond-path.htm',
        2
      ),
      (
        'acadia',
        'Ocean Path / Thunder Hole',
        'landmark',
        'Park Loop Road',
        'Good backup',
        'A coastal walk that can work around Sand Beach parking and Thunder Hole tide timing.',
        'https://www.nps.gov/thingstodo/hike-ocean-path-trail.htm',
        3
      ),
      (
        'acadia',
        'Beehive Trail',
        'hike',
        'Sand Beach',
        'Do early',
        'A steep rung-and-ladder route where crowds, wet rock, and exposure matter.',
        'https://www.nps.gov/thingstodo/hike-beehive-loop.htm',
        4
      ),
      (
        'glacier',
        'Hidden Lake Overlook',
        'hike',
        'Logan Pass',
        'Do early',
        'Logan Pass parking is tight, so pair this with the earliest arrival window you can manage.',
        'https://www.nps.gov/places/hidden-lake-trailhead.htm',
        1
      ),
      (
        'glacier',
        'Avalanche Lake',
        'hike',
        'Lake McDonald Valley',
        'Do early',
        'A popular west-side hike where the Avalanche area fills quickly in peak season.',
        'https://www.nps.gov/thingstodo/hike-to-avalanche-lake.htm',
        2
      ),
      (
        'glacier',
        'Lake McDonald',
        'landmark',
        'Lake McDonald Valley',
        'Anytime stop',
        'A scenic west-side anchor that works well before or after a higher-demand trail.',
        'https://www.nps.gov/glac/planyourvisit/lakemcdonald.htm',
        3
      ),
      (
        'glacier',
        'Grinnell Glacier Area',
        'hike',
        'Many Glacier',
        'Do early',
        'Build in extra time for Many Glacier access, exposed hiking, and changing trail status.',
        'https://www.nps.gov/places/grinnell-glacier-trailhead.htm',
        4
      ),
      (
        'arches',
        'Delicate Arch',
        'hike',
        'Wolfe Ranch',
        'Do early',
        'Start early to avoid peak heat and the busiest trailhead window.',
        'https://www.nps.gov/arch/planyourvisit/placestogo.htm',
        1
      ),
      (
        'arches',
        'Devils Garden',
        'hike',
        'End of park road',
        'Do early',
        'The end-of-road lot and longer trail options reward an early start.',
        'https://www.nps.gov/arch/planyourvisit/devils-garden.htm',
        2
      ),
      (
        'arches',
        'The Windows Section',
        'landmark',
        'Windows Road',
        'Good backup',
        'A compact area with several arches that can flex around the busier Delicate Arch windows.',
        'https://www.nps.gov/arch/planyourvisit/the-windows.htm',
        3
      ),
      (
        'arches',
        'Landscape Arch',
        'landmark',
        'Devils Garden',
        'Do early',
        'A shorter Devils Garden target before the trail gets harder beyond the arch.',
        'https://www.nps.gov/arch/planyourvisit/devils-garden.htm',
        4
      ),
      (
        'mount-rainier',
        'Skyline Trail / Paradise',
        'hike',
        'Paradise',
        'Do early',
        'Paradise parking pressure and afternoon cloud buildup make morning the strongest bet.',
        'https://www.nps.gov/places/paradise-meadows-skyline.htm',
        1
      ),
      (
        'mount-rainier',
        'Myrtle Falls',
        'viewpoint',
        'Paradise',
        'Good backup',
        'A short Paradise-area stop that works when the bigger Skyline loop needs trimming.',
        'https://www.nps.gov/places/myrtle-falls.htm',
        2
      ),
      (
        'mount-rainier',
        'Reflection Lakes',
        'viewpoint',
        'Stevens Canyon Road',
        'Anytime stop',
        'A scenic seasonal road stop that pairs well with Paradise when Stevens Canyon Road is open.',
        'https://www.nps.gov/places/reflection-lakes.htm',
        3
      ),
      (
        'mount-rainier',
        'Sunrise / Sourdough Ridge',
        'hike',
        'Sunrise',
        'Do early',
        'Treat Sunrise as a separate high-country plan with seasonal road access and limited parking.',
        'https://www.nps.gov/places/sunrise-sourdough-ridge-trailhead.htm',
        4
      ),
      (
        'shenandoah',
        'Old Rag',
        'hike',
        'Old Rag area',
        'Reservation-aware',
        'Day-use tickets may be required; start early and plan for a demanding route.',
        'https://www.nps.gov/places/old-rag.htm',
        1
      ),
      (
        'shenandoah',
        'Stony Man',
        'viewpoint',
        'Skyline Drive',
        'Good backup',
        'A short summit view that works well when you want a lower-commitment stop.',
        'https://www.nps.gov/thingstodo/stony-man.htm',
        2
      ),
      (
        'shenandoah',
        'Dark Hollow Falls',
        'hike',
        'Big Meadows',
        'Do early',
        'A popular steep waterfall hike where the return climb and parking demand deserve a buffer.',
        'https://www.nps.gov/thingstodo/dark-hollow-falls.htm',
        3
      ),
      (
        'shenandoah',
        'Hawksbill Summit',
        'viewpoint',
        'Central District',
        'Anytime stop',
        'A short, steep route to the park high point that can fit around Skyline Drive timing.',
        'https://www.nps.gov/thingstodo/hawksbill-summit.htm',
        4
      )
  ) as highlights(
    park_slug,
    name,
    kind,
    area,
    timing_label,
    planning_note,
    source_url,
    display_order
  )
)
insert into public.park_highlights (
  park_id,
  name,
  kind,
  area,
  timing_label,
  planning_note,
  source_url,
  display_order
)
select
  parks.id,
  launch_highlights.name,
  launch_highlights.kind,
  launch_highlights.area,
  launch_highlights.timing_label,
  launch_highlights.planning_note,
  launch_highlights.source_url,
  launch_highlights.display_order
from launch_highlights
join public.parks
  on parks.slug = launch_highlights.park_slug;
