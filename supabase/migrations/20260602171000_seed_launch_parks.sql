with inserted_parks as (
  insert into public.parks (
    slug,
    name,
    full_name,
    state,
    nps_park_code,
    ridb_facility_ids,
    latitude,
    longitude,
    timezone,
    data_tier,
    requires_reservation,
    reservation_note,
    gradient,
    blurb,
    is_active
  )
  values
    (
      'yosemite',
      'Yosemite',
      'Yosemite National Park',
      'California',
      'yose',
      null::text[],
      37.8651,
      -119.5383,
      'America/Los_Angeles',
      2,
      false,
      'Real-time traffic feed',
      'linear-gradient(150deg,#3a6b4a 0%,#5d8a5f 55%,#a9c08a 100%)',
      'Granite walls, waterfalls, and valley roads that reward early starts.',
      true
    ),
    (
      'rocky-mountain',
      'Rocky Mountain',
      'Rocky Mountain National Park',
      'Colorado',
      'romo',
      null::text[],
      40.3428,
      -105.6836,
      'America/Denver',
      1,
      true,
      'Timed entry · May–Oct',
      'linear-gradient(150deg,#3b5a6b 0%,#5f7d8a 55%,#9bb0bc 100%)',
      'High alpine drives and lake corridors where timed entry shapes the day.',
      true
    ),
    (
      'zion',
      'Zion',
      'Zion National Park',
      'Utah',
      'zion',
      null::text[],
      37.2982,
      -113.0263,
      'America/Denver',
      1,
      true,
      'Angels Landing lottery',
      'linear-gradient(150deg,#9a5a32 0%,#c08552 55%,#e0b487 100%)',
      'Canyon shuttles, trailhead queues, and desert light that favor a plan.',
      true
    ),
    (
      'acadia',
      'Acadia',
      'Acadia National Park',
      'Maine',
      'acad',
      null::text[],
      44.3386,
      -68.2733,
      'America/New_York',
      1,
      true,
      'Cadillac Summit · May–Oct',
      'linear-gradient(150deg,#3a5d5a 0%,#5f8a86 55%,#a7c5b8 100%)',
      'Coastal roads, summit reservations, and compact parking areas by the sea.',
      true
    ),
    (
      'glacier',
      'Glacier',
      'Glacier National Park',
      'Montana',
      'glac',
      null::text[],
      48.7596,
      -113.787,
      'America/Denver',
      2,
      false,
      'Logan Pass managed',
      'linear-gradient(150deg,#42597a 0%,#6b82a3 55%,#a9bcd0 100%)',
      'Big mountain roads and trailheads where summer mornings move quickly.',
      true
    ),
    (
      'arches',
      'Arches',
      'Arches National Park',
      'Utah',
      'arch',
      null::text[],
      38.7331,
      -109.5925,
      'America/Denver',
      2,
      false,
      'Arrive before 8 AM',
      'linear-gradient(150deg,#a8552e 0%,#c87d4a 55%,#e3a877 100%)',
      'Desert windows, finite parking, and heat that make timing matter.',
      true
    ),
    (
      'mount-rainier',
      'Mount Rainier',
      'Mount Rainier National Park',
      'Washington',
      'mora',
      null::text[],
      46.8523,
      -121.7603,
      'America/Los_Angeles',
      2,
      false,
      'Reservation-free 2026',
      'linear-gradient(150deg,#4a5a72 0%,#73849c 55%,#b3c1d2 100%)',
      'Volcanic views, short weather windows, and busy Paradise and Sunrise lots.',
      true
    ),
    (
      'shenandoah',
      'Shenandoah',
      'Shenandoah National Park',
      'Virginia',
      'shen',
      null::text[],
      38.6633,
      -78.3727,
      'America/New_York',
      1,
      true,
      'Old Rag day-use ticket',
      'linear-gradient(150deg,#4a6b3a 0%,#6f8a52 55%,#aec087 100%)',
      'Skyline Drive overlooks, trailhead tickets, and fall color crowd patterns.',
      true
    )
  returning id, slug
)
insert into public.lots (
  park_id,
  name,
  note,
  typical_fill_hour,
  display_order
)
select
  inserted_parks.id,
  launch_lots.name,
  launch_lots.note,
  launch_lots.typical_fill_hour,
  launch_lots.display_order
from inserted_parks
join (
  values
    ('yosemite', 'Yosemite Valley', 'Fills early on peak summer mornings', 8, 1),
    ('yosemite', 'Mariposa Grove', 'Shuttle parking can tighten by late morning', 10, 2),
    ('yosemite', 'Tuolumne Meadows', 'Seasonal access with midday pressure', 11, 3),
    ('rocky-mountain', 'Bear Lake Corridor', 'Timed entry area with early lot pressure', 7, 1),
    ('rocky-mountain', 'Glacier Gorge', 'Popular trailhead that fills quickly', 8, 2),
    ('rocky-mountain', 'Alpine Visitor Center', 'Trail Ridge Road peak stop', 10, 3),
    ('zion', 'Visitor Center', 'Primary shuttle parking fills early', 8, 1),
    ('zion', 'Canyon Junction', 'Limited access and high trail demand', 9, 2),
    ('zion', 'Kolob Canyons', 'Quieter district with later fill patterns', 12, 3),
    ('acadia', 'Cadillac Mountain Summit', 'Reservation area with sunrise demand', 6, 1),
    ('acadia', 'Jordan Pond', 'Restaurant and loop trail demand builds midmorning', 9, 2),
    ('acadia', 'Sand Beach', 'Beach and trailhead access fills on warm days', 10, 3),
    ('glacier', 'Logan Pass', 'Often full by midmorning in peak season', 8, 1),
    ('glacier', 'Apgar Village', 'West-side access with steady visitor pressure', 10, 2),
    ('glacier', 'Many Glacier', 'Remote valley with limited parking', 9, 3),
    ('arches', 'Devils Garden', 'End-of-road trailhead fills fast', 8, 1),
    ('arches', 'Windows Section', 'Popular short walks and viewpoints', 9, 2),
    ('arches', 'Delicate Arch / Wolfe Ranch', 'Sunrise and sunset demand', 8, 3),
    ('mount-rainier', 'Paradise', 'Primary south-side destination', 9, 1),
    ('mount-rainier', 'Sunrise', 'Seasonal high-country lot', 10, 2),
    ('mount-rainier', 'Longmire', 'Lower-elevation access with steadier flow', 11, 3),
    ('shenandoah', 'Old Rag', 'Ticketed high-demand hike', 7, 1),
    ('shenandoah', 'Stony Man', 'Popular Skyline Drive trailhead', 10, 2),
    ('shenandoah', 'Big Meadows', 'Central hub with lodge and trail access', 11, 3)
) as launch_lots(slug, name, note, typical_fill_hour, display_order)
  on launch_lots.slug = inserted_parks.slug;

with park_profiles as (
  select
    parks.id,
    parks.slug,
    case
      when parks.slug in (
        'yosemite',
        'rocky-mountain',
        'glacier',
        'mount-rainier'
      ) then array[
        0.25, 0.25, 0.35, 0.55, 0.75, 0.95,
        1.00, 0.92, 0.70, 0.45, 0.30, 0.25
      ]::numeric[]
      when parks.slug in ('zion', 'arches') then array[
        0.55, 0.65, 0.85, 0.95, 0.78, 0.65,
        0.60, 0.62, 0.88, 1.00, 0.72, 0.52
      ]::numeric[]
      else array[
        0.20, 0.22, 0.32, 0.50, 0.70, 0.85,
        0.95, 0.90, 0.85, 1.00, 0.55, 0.28
      ]::numeric[]
    end as month_weights
  from public.parks
  where parks.slug in (
    'yosemite',
    'rocky-mountain',
    'zion',
    'acadia',
    'glacier',
    'arches',
    'mount-rainier',
    'shenandoah'
  )
),
months as (
  select generate_series(1, 12) as month
),
days as (
  select generate_series(0, 6) as dow
)
insert into public.visitation_history (
  park_id,
  month,
  dow,
  relative_busyness
)
select
  park_profiles.id,
  months.month,
  days.dow,
  round(
    least(
      1.00::numeric,
      greatest(
        0.05::numeric,
        park_profiles.month_weights[months.month]
          * case days.dow
            when 0 then 0.92
            when 1 then 0.72
            when 2 then 0.68
            when 3 then 0.70
            when 4 then 0.78
            when 5 then 0.90
            else 1.00
          end
      )
    ),
    3
  ) as relative_busyness
from park_profiles
cross join months
cross join days;
