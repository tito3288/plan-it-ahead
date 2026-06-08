create table public.park_stay_options (
  id uuid primary key default gen_random_uuid(),
  park_id uuid not null references public.parks(id) on delete cascade,
  name text not null,
  kind text not null check (
    kind in ('gateway_town', 'in_park_lodging', 'campground_area')
  ),
  area text not null,
  best_for_label text not null,
  drive_note text not null,
  planning_note text not null,
  source_url text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (park_id, name)
);

create index park_stay_options_park_active_order_idx
on public.park_stay_options (park_id, is_active, display_order, name);

create trigger park_stay_options_set_updated_at
before update on public.park_stay_options
for each row execute function public.set_updated_at();

alter table public.park_stay_options enable row level security;

create policy "Park stay options are publicly readable"
on public.park_stay_options for select
using (true);

with launch_stay_options as (
  select *
  from (
    values
      (
        'yosemite',
        'Yosemite Valley lodging',
        'in_park_lodging',
        'Yosemite Valley',
        'Closest base',
        'Inside the Valley near shuttle stops and several core trailheads.',
        'Best when the trip depends on the earliest possible Valley start, but availability is limited and plans should be made far ahead.',
        'https://www.nps.gov/yose/planyourvisit/lodging.htm',
        1
      ),
      (
        'yosemite',
        'Wawona / South Entrance',
        'in_park_lodging',
        'South park',
        'Sequoia base',
        'Useful for Mariposa Grove and the southern entrance corridor.',
        'A calmer base for south-side plans, with a longer drive to Yosemite Valley.',
        'https://www.nps.gov/yose/planyourvisit/wawona.htm',
        2
      ),
      (
        'yosemite',
        'El Portal / Mariposa gateway',
        'gateway_town',
        'West and southwest gateways',
        'Flexible gateway',
        'Outside-park base with access toward Arch Rock or the Highway 140 corridor.',
        'Good when in-park lodging is unavailable and you still want a practical early start.',
        'https://www.yosemite.com/',
        3
      ),
      (
        'rocky-mountain',
        'Estes Park east base',
        'gateway_town',
        'East entrances',
        'Bear Lake access',
        'Closest major gateway for Beaver Meadows, Fall River, and Bear Lake Road plans.',
        'Best for Bear Lake Corridor mornings and east-side services before or after the park day.',
        'https://www.visitestespark.com/visitors/',
        1
      ),
      (
        'rocky-mountain',
        'Grand Lake west base',
        'gateway_town',
        'West entrance',
        'Quieter west side',
        'Positions the trip near the Kawuneeche Valley and west-side Trail Ridge Road access.',
        'Useful when your plan favors the west side or a quieter overnight base.',
        'https://gograndlake.com/',
        2
      ),
      (
        'rocky-mountain',
        'RMNP campgrounds',
        'campground_area',
        'In and near the park',
        'Campground plan',
        'Seasonal park campgrounds can shorten the morning drive when reservations line up.',
        'Check reservation windows and seasonal operating dates before building the day around a campground.',
        'https://www.nps.gov/romo/planyourvisit/camping.htm',
        3
      ),
      (
        'zion',
        'Springdale / South Entrance',
        'gateway_town',
        'Zion Canyon',
        'Shuttle-friendly base',
        'Closest gateway for the pedestrian entrance and Zion Canyon shuttle system.',
        'Best when you want to reduce parking pressure and start the canyon day without moving the car early.',
        'https://www.springdale.utah.gov/293/Zion-Canyon-Visitors-Bureau',
        1
      ),
      (
        'zion',
        'Zion campgrounds',
        'campground_area',
        'South Entrance area',
        'Closest campground',
        'South and Watchman campgrounds sit near the main canyon shuttle access.',
        'Strong fit for early canyon plans when campground reservations and seasonal operations match your dates.',
        'https://www.nps.gov/zion/planyourvisit/campgrounds-in-zion.htm',
        2
      ),
      (
        'zion',
        'East Zion / Kanab',
        'gateway_town',
        'East side',
        'Quieter approach',
        'A better fit for east-side routes, Kolob-area add-ons, or a longer regional trip.',
        'Expect more driving to the main canyon and watch tunnel or entrance delays on busy days.',
        'https://www.nps.gov/zion/planyourvisit/directions.htm',
        3
      ),
      (
        'acadia',
        'Bar Harbor',
        'gateway_town',
        'Mount Desert Island',
        'Classic gateway',
        'Closest full-service base for many Park Loop Road, Ocean Drive, and Jordan Pond plans.',
        'Best when you want services nearby and can plan around summer traffic and parking pressure.',
        'https://www.barharbormaine.gov/241/Visit-Bar-Harbor',
        1
      ),
      (
        'acadia',
        'Blackwoods / Seawall campgrounds',
        'campground_area',
        'Mount Desert Island',
        'Campground base',
        'Park campgrounds can keep you close to Mount Desert Island drives and trailheads.',
        'Reserve ahead and check which campground best matches your side of the island.',
        'https://www.nps.gov/acad/planyourvisit/camping.htm',
        2
      ),
      (
        'acadia',
        'Schoodic / Winter Harbor',
        'gateway_town',
        'Schoodic Peninsula',
        'Quieter base',
        'A quieter coastal base for the Schoodic district, away from the busiest Mount Desert Island flow.',
        'Good for travelers who want a slower base and are comfortable driving or ferrying for island plans.',
        'https://www.nps.gov/acad/planyourvisit/schoodic.htm',
        3
      ),
      (
        'glacier',
        'West Glacier / Apgar',
        'gateway_town',
        'West entrance',
        'West-side base',
        'Strong base for Lake McDonald, Apgar, and west-side Going-to-the-Sun Road access.',
        'Plan extra time for entrance lines and road-status changes during peak season.',
        'https://www.nps.gov/glac/planyourvisit/lodgingrestaurantsservices.htm',
        1
      ),
      (
        'glacier',
        'St. Mary / East Glacier',
        'gateway_town',
        'East side',
        'East-side launch',
        'Useful for east-side road access, St. Mary, and regional approaches to Many Glacier.',
        'Best when your plan starts east of the Continental Divide or avoids a west-side morning drive.',
        'https://www.nps.gov/glac/planyourvisit/eastside.htm',
        2
      ),
      (
        'glacier',
        'Many Glacier',
        'in_park_lodging',
        'Many Glacier valley',
        'Trailhead base',
        'Closest base for Many Glacier trailheads when lodging or campground plans line up.',
        'Treat it as a separate valley plan with limited access, high demand, and changing seasonal status.',
        'https://www.nps.gov/glac/planyourvisit/manyglacier.htm',
        3
      ),
      (
        'arches',
        'Moab',
        'gateway_town',
        'South of the park',
        'Main gateway',
        'Closest full-service base for Arches and the broader Moab area.',
        'Best for early park entries, but expect town and entrance congestion during busy travel windows.',
        'https://www.discovermoab.com/',
        1
      ),
      (
        'arches',
        'Devils Garden Campground',
        'campground_area',
        'Inside Arches',
        'Inside-park camping',
        'The park campground sits near the end of the road by Devils Garden.',
        'A strong option for early trail access when reservations, heat, and seasonal conditions work.',
        'https://www.nps.gov/arch/planyourvisit/camping.htm',
        2
      ),
      (
        'arches',
        'Green River / Spanish Valley',
        'gateway_town',
        'Regional bases',
        'Flexible overflow',
        'Regional bases can work when Moab availability is tight or the trip includes more than Arches.',
        'Expect a longer morning drive and keep the park entry forecast in mind.',
        'https://www.discovermoab.com/',
        3
      ),
      (
        'mount-rainier',
        'Longmire / National Park Inn',
        'in_park_lodging',
        'Southwest park',
        'Inside-park base',
        'Lower-elevation in-park base with access toward Longmire and Paradise.',
        'Useful for south-side plans when lodging availability and road status match your dates.',
        'https://www.nps.gov/mora/planyourvisit/lodging.htm',
        1
      ),
      (
        'mount-rainier',
        'Ashford / Paradise southwest base',
        'gateway_town',
        'Nisqually entrance',
        'Paradise approach',
        'Common gateway for Paradise and Longmire plans from the southwest side.',
        'Best when Paradise is the main target and you want services outside the park before an early start.',
        'https://visitrainier.com/',
        2
      ),
      (
        'mount-rainier',
        'Packwood / Ohanapecosh base',
        'gateway_town',
        'Southeast side',
        'Quieter southeast',
        'Works for Stevens Canyon, Ohanapecosh, and southeast-side park plans.',
        'A useful base when the trip favors the southeast side or you want a different approach to Paradise.',
        'https://visitrainier.com/',
        3
      ),
      (
        'shenandoah',
        'Skyland / Big Meadows',
        'in_park_lodging',
        'Central Skyline Drive',
        'Central park base',
        'In-park lodging keeps you near central Skyline Drive overlooks and trailheads.',
        'Best when you want to reduce gate-to-trail driving and focus on the central district.',
        'https://www.nps.gov/shen/planyourvisit/lodging.htm',
        1
      ),
      (
        'shenandoah',
        'Luray / Front Royal gateway',
        'gateway_town',
        'North and central access',
        'Gateway flexibility',
        'Outside-park bases that work for north or central Skyline Drive entries.',
        'Good when in-park rooms are full or your route starts before or after Shenandoah.',
        'https://www.visitshenandoah.org/',
        2
      ),
      (
        'shenandoah',
        'Loft Mountain / Big Meadows campgrounds',
        'campground_area',
        'Skyline Drive',
        'Campground base',
        'Park campgrounds can anchor a Skyline Drive plan close to trails and overlooks.',
        'Check seasonal opening dates and reservation details before counting on a campground base.',
        'https://www.nps.gov/shen/planyourvisit/campgrounds.htm',
        3
      )
  ) as stay_options(
    park_slug,
    name,
    kind,
    area,
    best_for_label,
    drive_note,
    planning_note,
    source_url,
    display_order
  )
)
insert into public.park_stay_options (
  park_id,
  name,
  kind,
  area,
  best_for_label,
  drive_note,
  planning_note,
  source_url,
  display_order
)
select
  parks.id,
  launch_stay_options.name,
  launch_stay_options.kind,
  launch_stay_options.area,
  launch_stay_options.best_for_label,
  launch_stay_options.drive_note,
  launch_stay_options.planning_note,
  launch_stay_options.source_url,
  launch_stay_options.display_order
from launch_stay_options
join public.parks
  on parks.slug = launch_stay_options.park_slug;
