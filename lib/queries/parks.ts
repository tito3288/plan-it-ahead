import type { PostgrestError } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/types/database";

export type Park = Tables<"parks">;
export type Lot = Tables<"lots">;
export type DailyForecast = Tables<"daily_forecast">;
export type WeatherCache = Tables<"weather_cache">;
export type Alert = Tables<"alerts">;
export type SavedTrip = Tables<"saved_trips">;
export type SavedTripInsert = TablesInsert<"saved_trips">;

export type ParkWithLots = Park & {
  lots: Lot[];
};

export type SavedTripWithPark = SavedTrip & {
  park: Park;
};

export type DateRange = {
  start: string;
  end: string;
};

type SavedTripInsertQuery = {
  insert(trip: SavedTripInsert): {
    select(columns: string): {
      single(): Promise<{
        data: SavedTrip | null;
        error: PostgrestError | null;
      }>;
    };
  };
};

function throwIfError(error: PostgrestError | null) {
  if (error) {
    throw new Error(error.message);
  }
}

export async function getActiveParks(): Promise<Park[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("parks")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  throwIfError(error);

  return (data ?? []) as Park[];
}

export async function getParkBySlug(
  slug: string
): Promise<ParkWithLots | null> {
  const supabase = createClient();

  const { data: parkData, error: parkError } = await supabase
    .from("parks")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  throwIfError(parkError);

  const park = parkData as Park | null;

  if (!park) {
    return null;
  }

  const { data: lots, error: lotsError } = await supabase
    .from("lots")
    .select("*")
    .eq("park_id", park.id)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  throwIfError(lotsError);

  return {
    ...park,
    lots: (lots ?? []) as Lot[]
  };
}

export async function getForecast(
  parkId: string,
  dateRange: DateRange
): Promise<DailyForecast[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("daily_forecast")
    .select("*")
    .eq("park_id", parkId)
    .gte("forecast_date", dateRange.start)
    .lte("forecast_date", dateRange.end)
    .order("forecast_date", { ascending: true });

  throwIfError(error);

  return (data ?? []) as DailyForecast[];
}

export async function getParkWeather(
  parkId: string,
  dateRange: DateRange
): Promise<WeatherCache[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("weather_cache")
    .select("*")
    .eq("park_id", parkId)
    .gte("forecast_date", dateRange.start)
    .lte("forecast_date", dateRange.end)
    .order("forecast_date", { ascending: true });

  throwIfError(error);

  return (data ?? []) as WeatherCache[];
}

export async function getParkAlerts(parkId: string): Promise<Alert[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("park_id", parkId)
    .order("last_seen_at", { ascending: false });

  throwIfError(error);

  return (data ?? []) as Alert[];
}

export async function getSavedTrips(userId: string): Promise<SavedTrip[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("saved_trips")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  throwIfError(error);

  return (data ?? []) as SavedTrip[];
}

type SavedTripWithParkRow = SavedTrip & {
  parks: Park;
};

export async function getSavedTripsWithParks(
  userId: string
): Promise<SavedTripWithPark[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("saved_trips")
    .select("*, parks(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  throwIfError(error);

  const rows = (data ?? []) as unknown as SavedTripWithParkRow[];

  return rows.map(({ parks, ...trip }) => ({
    ...trip,
    park: parks
  }));
}

export async function findSavedTrip({
  endDate,
  parkId,
  startDate,
  userId
}: {
  endDate: string | null;
  parkId: string;
  startDate: string;
  userId: string;
}): Promise<SavedTrip | null> {
  const supabase = createClient();
  let query = supabase
    .from("saved_trips")
    .select("*")
    .eq("user_id", userId)
    .eq("park_id", parkId)
    .eq("start_date", startDate);

  query = endDate ? query.eq("end_date", endDate) : query.is("end_date", null);

  const { data, error } = await query.maybeSingle();

  throwIfError(error);

  return data as SavedTrip | null;
}

export async function createSavedTrip(
  trip: SavedTripInsert
): Promise<SavedTrip> {
  const supabase = createClient();
  const savedTrips = supabase.from(
    "saved_trips"
  ) as unknown as SavedTripInsertQuery;

  const { data, error } = await savedTrips.insert(trip).select("*").single();

  throwIfError(error);

  if (!data) {
    throw new Error("Saved trip insert did not return a row.");
  }

  return data as SavedTrip;
}

export async function deleteSavedTrip(
  tripId: string,
  userId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("saved_trips")
    .delete()
    .eq("id", tripId)
    .eq("user_id", userId);

  throwIfError(error);
}
