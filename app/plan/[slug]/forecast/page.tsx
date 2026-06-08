import { notFound } from "next/navigation";

import { BrandHeader } from "@/components/flow/BrandHeader";
import { ForecastView } from "@/components/forecast/ForecastView";
import type {
  ForecastAlert,
  ForecastConfidence,
  ForecastDay,
  ForecastDayData,
  ForecastHighlight,
  ForecastLotPrediction,
  ForecastPark,
  ForecastSource,
  ForecastStayOption
} from "@/components/forecast/types";
import { forecastConfig, type ForecastStatus } from "@/lib/forecast/config";
import { getCurrentUser } from "@/lib/auth/session";
import {
  findSavedTrip,
  getForecast,
  getParkAlerts,
  getParkHighlights,
  getParkBySlug,
  getParkStayOptions,
  getParkWeather,
  type DailyForecast,
  type ParkHighlight,
  type ParkStayOption,
  type WeatherCache
} from "@/lib/queries/parks";
import type { Json } from "@/types/database";

export const dynamic = "force-dynamic";

type ForecastPageProps = {
  params: {
    slug: string;
  };
  searchParams: {
    end?: string;
    start?: string;
  };
};

const maxRangeDays = forecastConfig.forecastWindowDays;

function parseIsoDate(date: string | undefined) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function todayUtc() {
  const now = new Date();

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

function daysBetween(start: Date, end: Date) {
  const msPerDay = 24 * 60 * 60 * 1000;

  return Math.round((end.getTime() - start.getTime()) / msPerDay);
}

function buildDateRange(start: Date, end: Date) {
  const totalDays = daysBetween(start, end);

  return Array.from({ length: totalDays + 1 }, (_, index) =>
    toIsoDate(addDays(start, index))
  );
}

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric"
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatDateRangeLabel(start: string, end: string) {
  if (start === end) {
    return formatDateLabel(start);
  }

  return `${formatDateLabel(start)} – ${formatDateLabel(end)}`;
}

function loginHref(next: string) {
  return `/login?next=${encodeURIComponent(next)}`;
}

function isRecord(value: Json): value is { [key: string]: Json | undefined } {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isForecastStatus(value: number): value is ForecastStatus {
  return value === 0 || value === 1 || value === 2;
}

function parseConfidence(value: string): ForecastConfidence {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }

  return "low";
}

function parseSource(value: string): ForecastSource {
  if (value === "live" || value === "mixed" || value === "prediction") {
    return value;
  }

  return "prediction";
}

function parseHighlightKind(value: string): ForecastHighlight["kind"] | null {
  if (value === "hike" || value === "landmark" || value === "viewpoint") {
    return value;
  }

  return null;
}

function parseTimingLabel(
  value: string
): ForecastHighlight["timing_label"] | null {
  if (
    value === "Do early" ||
    value === "Good backup" ||
    value === "Anytime stop" ||
    value === "Reservation-aware"
  ) {
    return value;
  }

  return null;
}

function parseStayOptionKind(value: string): ForecastStayOption["kind"] | null {
  if (
    value === "gateway_town" ||
    value === "in_park_lodging" ||
    value === "campground_area"
  ) {
    return value;
  }

  return null;
}

function parseDailyPlan(value: Json | null): string[] {
  if (!Array.isArray(value)) {
    return ["Arrive early and keep one flexible backup stop in your plan."];
  }

  const steps = value.filter(
    (step): step is string => typeof step === "string" && step.trim().length > 0
  );

  return steps.length > 0
    ? steps
    : ["Arrive early and keep one flexible backup stop in your plan."];
}

function parseLotPredictions(value: Json): ForecastLotPrediction[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item): ForecastLotPrediction[] => {
    if (!isRecord(item)) {
      return [];
    }

    const arriveBy = item.arrive_by;
    const level = item.level;
    const lotId = item.lot_id;
    const lotName = item.lot_name;
    const note = item.note;

    if (
      typeof arriveBy !== "string" ||
      typeof level !== "number" ||
      !isForecastStatus(level) ||
      typeof lotId !== "string" ||
      typeof lotName !== "string"
    ) {
      return [];
    }

    return [
      {
        arrive_by: arriveBy,
        level,
        lot_id: lotId,
        lot_name: lotName,
        note: typeof note === "string" ? note : null
      }
    ];
  });
}

function adaptHighlight(row: ParkHighlight): ForecastHighlight | null {
  const kind = parseHighlightKind(row.kind);
  const timingLabel = parseTimingLabel(row.timing_label);

  if (!kind || !timingLabel) {
    return null;
  }

  return {
    area: row.area,
    id: row.id,
    kind,
    name: row.name,
    planning_note: row.planning_note,
    source_url: row.source_url,
    timing_label: timingLabel
  };
}

function adaptStayOption(row: ParkStayOption): ForecastStayOption | null {
  const kind = parseStayOptionKind(row.kind);

  if (!kind) {
    return null;
  }

  return {
    area: row.area,
    best_for_label: row.best_for_label,
    drive_note: row.drive_note,
    id: row.id,
    kind,
    name: row.name,
    planning_note: row.planning_note,
    source_url: row.source_url
  };
}

function adaptForecast(
  row: DailyForecast,
  weather: WeatherCache | undefined,
  weatherWindowEnd: string
): ForecastDayData | null {
  const hourlyStatus = row.hourly_status.filter(isForecastStatus);

  if (hourlyStatus.length !== 14) {
    return null;
  }

  return {
    confidence: parseConfidence(row.confidence),
    daily_plan: parseDailyPlan(row.daily_plan),
    headline: row.headline,
    hourly_status: hourlyStatus,
    is_seasonal_estimate:
      row.weather_summary === null && row.forecast_date > weatherWindowEnd,
    lot_predictions: parseLotPredictions(row.lot_predictions),
    source: parseSource(row.source),
    weather_code: weather?.weather_code ?? null,
    weather_summary: row.weather_summary
  };
}

export default async function ForecastPage({
  params,
  searchParams
}: ForecastPageProps) {
  const park = await getParkBySlug(params.slug);

  if (!park) {
    notFound();
  }

  const startDate = parseIsoDate(searchParams.start);
  const endDate = parseIsoDate(searchParams.end) ?? startDate;

  if (!startDate || !endDate) {
    notFound();
  }

  const rangeDays = daysBetween(startDate, endDate);

  if (rangeDays < 0 || rangeDays > maxRangeDays) {
    notFound();
  }

  const start = toIsoDate(startDate);
  const end = toIsoDate(endDate);
  const dates = buildDateRange(startDate, endDate);
  const today = todayUtc();
  const weatherWindowEnd = toIsoDate(
    addDays(today, forecastConfig.weatherHorizonDays - 1)
  );
  const weatherQueryEnd = end < weatherWindowEnd ? end : weatherWindowEnd;
  const user = await getCurrentUser();
  const normalizedEnd = end !== start ? end : null;
  const shouldFetchWeather = start <= weatherWindowEnd;
  const [
    forecastRows,
    alerts,
    highlights,
    stayOptions,
    weatherRows,
    savedTrip
  ] = await Promise.all([
    getForecast(park.id, { end, start }),
    getParkAlerts(park.id),
    getParkHighlights(park.id),
    getParkStayOptions(park.id),
    shouldFetchWeather
      ? getParkWeather(park.id, { end: weatherQueryEnd, start })
      : Promise.resolve([]),
    user
      ? findSavedTrip({
          endDate: normalizedEnd,
          parkId: park.id,
          startDate: start,
          userId: user.id
        })
      : Promise.resolve(null)
  ]);
  const weatherByDate = new Map(
    weatherRows.map((row) => [row.forecast_date, row])
  );
  const forecastByDate = new Map(
    forecastRows.map((row) => [
      row.forecast_date,
      adaptForecast(row, weatherByDate.get(row.forecast_date), weatherWindowEnd)
    ])
  );
  const forecastDays: ForecastDay[] = dates.map((date) => ({
    date,
    forecast: forecastByDate.get(date) ?? null
  }));
  const forecastPark: ForecastPark = {
    full_name: park.full_name,
    id: park.id,
    name: park.name,
    requires_reservation: park.requires_reservation,
    reservation_note: park.reservation_note,
    slug: park.slug
  };
  const forecastAlerts: ForecastAlert[] = alerts.map((alert) => ({
    category: alert.category,
    description: alert.description,
    id: alert.id,
    title: alert.title,
    url: alert.url
  }));
  const forecastHighlights = highlights.flatMap((highlight) => {
    const adapted = adaptHighlight(highlight);

    return adapted ? [adapted] : [];
  });
  const forecastStayOptions = stayOptions.flatMap((stayOption) => {
    const adapted = adaptStayOption(stayOption);

    return adapted ? [adapted] : [];
  });

  return (
    <main className="min-h-screen pb-12">
      <BrandHeader step={3} />
      <ForecastView
        alerts={forecastAlerts}
        dateRangeLabel={formatDateRangeLabel(start, end)}
        days={forecastDays}
        highlights={forecastHighlights}
        park={forecastPark}
        saveTrip={{
          endDate: end,
          forecastPath: `/plan/${park.slug}/forecast?start=${start}&end=${end}`,
          initialSaved: Boolean(savedTrip),
          isSignedIn: Boolean(user),
          loginHref: loginHref(
            `/plan/${park.slug}/forecast?start=${start}&end=${end}`
          ),
          startDate: start,
          title: `${park.name} · ${formatDateRangeLabel(start, end)}`
        }}
        stayOptions={forecastStayOptions}
      />
    </main>
  );
}
