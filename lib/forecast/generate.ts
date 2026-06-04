import { computeDailyScore } from "@/lib/forecast/busyness";
import { isUsHoliday, isWeekend } from "@/lib/forecast/calendar";
import { computeConfidence } from "@/lib/forecast/confidence";
import { forecastConfig, type Confidence } from "@/lib/forecast/config";
import { buildHourlyStatus } from "@/lib/forecast/curve";
import { predictLots, type ForecastLot } from "@/lib/forecast/lots";
import { buildDailyPlan, buildHeadline } from "@/lib/forecast/plan";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json, Tables, TablesInsert } from "@/types/database";

type Park = Pick<
  Tables<"parks">,
  | "data_tier"
  | "id"
  | "requires_reservation"
  | "slug"
  | "timezone"
>;
type VisitationHistory = Pick<
  Tables<"visitation_history">,
  "dow" | "month" | "relative_busyness"
>;
type WeatherCache = Pick<
  Tables<"weather_cache">,
  | "forecast_date"
  | "precip_chance"
  | "summary"
  | "temp_high"
  | "temp_low"
  | "weather_code"
>;
type DailyForecastInsert = TablesInsert<"daily_forecast">;

export type ForecastGenerationError = {
  message: string;
  parkId?: string;
  parkSlug?: string;
};

export type ForecastGenerationSummary = {
  confidence: Record<Confidence, number>;
  errors: ForecastGenerationError[];
  parks: number;
  rows: number;
  windowDays: number;
};

export type ParkForecastContext = {
  alertsCount: number;
  history: VisitationHistory[];
  lots: ForecastLot[];
  park: Park;
  weather: WeatherCache[];
};

function dateKey(date: Date) {
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

export function buildForecastDateWindow(days = forecastConfig.forecastWindowDays) {
  const start = todayUtc();

  return Array.from({ length: days }, (_, index) => dateKey(addDays(start, index)));
}

function utcDateParts(date: string) {
  const value = new Date(`${date}T00:00:00Z`);

  return {
    dow: value.getUTCDay(),
    month: value.getUTCMonth() + 1
  };
}

function daysOut(date: string, dates: string[]) {
  const index = dates.indexOf(date);

  return index === -1 ? forecastConfig.forecastWindowDays : index;
}

function isWithinWeatherHorizon(date: string, dates: string[]) {
  const index = dates.indexOf(date);

  return index >= 0 && index < forecastConfig.weatherHorizonDays;
}

function earliestArriveBy(lotPredictions: Array<{ arrive_by: string }>) {
  return lotPredictions.find((prediction) => prediction.arrive_by !== "Anytime")
    ?.arrive_by ?? null;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown forecast error";
}

export function buildForecastRow(
  context: ParkForecastContext,
  forecastDate: string,
  dates: string[]
): DailyForecastInsert {
  const { dow, month } = utcDateParts(forecastDate);
  const history = context.history.find(
    (entry) => entry.month === month && entry.dow === dow
  );
  const weather = isWithinWeatherHorizon(forecastDate, dates)
    ? context.weather.find((entry) => entry.forecast_date === forecastDate)
    : undefined;
  const relativeBusyness = history?.relative_busyness ?? 0.45;
  const dailyScore = computeDailyScore({
    isHoliday: isUsHoliday(forecastDate),
    isWeekend: isWeekend(forecastDate),
    relativeBusyness,
    weather: weather
      ? {
          precipChance: weather.precip_chance,
          tempHigh: weather.temp_high,
          weatherCode: weather.weather_code
        }
      : null
  });
  const hourlyStatus = buildHourlyStatus(dailyScore);
  const lotPredictions = predictLots(
    context.lots,
    dailyScore,
    hourlyStatus,
    context.park.timezone
  );
  const confidence = computeConfidence({
    dataTier: context.park.data_tier,
    daysOut: daysOut(forecastDate, dates),
    hasWeather: Boolean(weather)
  });
  const plan = buildDailyPlan({
    dailyScore,
    earliestArriveBy: earliestArriveBy(lotPredictions),
    hasAlert: context.alertsCount > 0,
    hasReservation: context.park.requires_reservation
  });

  return {
    confidence,
    daily_plan: plan as Json,
    forecast_date: forecastDate,
    generated_at: new Date().toISOString(),
    headline: buildHeadline(dailyScore, dow),
    hourly_status: hourlyStatus,
    lot_predictions: lotPredictions as unknown as Json,
    park_id: context.park.id,
    source: context.park.requires_reservation ? "mixed" : "prediction",
    weather_summary: weather?.summary ?? null
  };
}

async function loadParkContext(
  parkId: string,
  dates: string[]
): Promise<ParkForecastContext | null> {
  const supabase = createAdminClient();
  const weatherEnd =
    dates[Math.min(dates.length, forecastConfig.weatherHorizonDays) - 1] ??
    dates[0];

  const { data: park, error: parkError } = await supabase
    .from("parks")
    .select("data_tier,id,requires_reservation,slug,timezone")
    .eq("id", parkId)
    .eq("is_active", true)
    .maybeSingle();

  if (parkError) {
    throw new Error(parkError.message);
  }

  if (!park) {
    return null;
  }

  const [
    { data: history, error: historyError },
    { data: lots, error: lotsError },
    { data: weather, error: weatherError },
    { count: alertsCount, error: alertsError }
  ] = await Promise.all([
    supabase
      .from("visitation_history")
      .select("dow,month,relative_busyness")
      .eq("park_id", park.id),
    supabase
      .from("lots")
      .select("id,name,note,typical_fill_hour")
      .eq("park_id", park.id)
      .order("display_order", { ascending: true }),
    supabase
      .from("weather_cache")
      .select(
        "forecast_date,precip_chance,summary,temp_high,temp_low,weather_code"
      )
      .eq("park_id", park.id)
      .gte("forecast_date", dates[0])
      .lte("forecast_date", weatherEnd),
    supabase
      .from("alerts")
      .select("id", { count: "exact", head: true })
      .eq("park_id", park.id)
  ]);

  if (historyError) {
    throw new Error(historyError.message);
  }

  if (lotsError) {
    throw new Error(lotsError.message);
  }

  if (weatherError) {
    throw new Error(weatherError.message);
  }

  if (alertsError) {
    throw new Error(alertsError.message);
  }

  return {
    alertsCount: alertsCount ?? 0,
    history: (history ?? []) as VisitationHistory[],
    lots: (lots ?? []) as ForecastLot[],
    park: park as Park,
    weather: (weather ?? []) as WeatherCache[]
  };
}

export async function generateForecastsForPark(
  parkId: string,
  dates: string[]
): Promise<ForecastGenerationSummary> {
  const summary: ForecastGenerationSummary = {
    confidence: { high: 0, low: 0, medium: 0 },
    errors: [],
    parks: 0,
    rows: 0,
    windowDays: dates.length
  };

  try {
    const context = await loadParkContext(parkId, dates);

    if (!context) {
      return summary;
    }

    summary.parks = 1;

    const rows = dates.map((date) => buildForecastRow(context, date, dates));

    const supabase = createAdminClient();
    const { error } = await supabase.from("daily_forecast").upsert(rows, {
      onConflict: "park_id,forecast_date"
    });

    if (error) {
      throw new Error(error.message);
    }

    summary.rows = rows.length;

    for (const row of rows) {
      summary.confidence[row.confidence as Confidence] += 1;
    }
  } catch (error) {
    summary.errors.push({
      message: errorMessage(error),
      parkId
    });
  }

  return summary;
}

export async function generateAllForecasts(): Promise<ForecastGenerationSummary> {
  const supabase = createAdminClient();
  const dates = buildForecastDateWindow();
  const summary: ForecastGenerationSummary = {
    confidence: { high: 0, low: 0, medium: 0 },
    errors: [],
    parks: 0,
    rows: 0,
    windowDays: dates.length
  };

  const { data: parks, error } = await supabase
    .from("parks")
    .select("id,slug")
    .eq("is_active", true);

  if (error) {
    throw new Error(error.message);
  }

  for (const park of (parks ?? []) as Array<Pick<Park, "id" | "slug">>) {
    const parkSummary = await generateForecastsForPark(park.id, dates);
    summary.parks += parkSummary.parks;
    summary.rows += parkSummary.rows;
    summary.confidence.high += parkSummary.confidence.high;
    summary.confidence.medium += parkSummary.confidence.medium;
    summary.confidence.low += parkSummary.confidence.low;
    summary.errors.push(
      ...parkSummary.errors.map((entry) => ({
        ...entry,
        parkSlug: park.slug
      }))
    );
  }

  return summary;
}
