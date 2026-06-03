import { createAdminClient } from "@/lib/supabase/admin";
import type { IngestError, SyncWeatherSummary } from "@/lib/ingest/types";
import { fetchWeather } from "@/lib/sources/weather";
import type { Tables, TablesInsert } from "@/types/database";

type Park = Pick<Tables<"parks">, "id" | "latitude" | "longitude" | "slug">;
type WeatherInsert = TablesInsert<"weather_cache">;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown weather sync error";
}

export async function syncWeather(days = 10): Promise<SyncWeatherSummary> {
  const supabase = createAdminClient();
  const summary: SyncWeatherSummary = {
    days,
    errors: [],
    parks: 0,
    upserted: 0
  };

  const { data: parks, error: parksError } = await supabase
    .from("parks")
    .select("id,latitude,longitude,slug")
    .eq("is_active", true);

  if (parksError) {
    throw new Error(parksError.message);
  }

  for (const park of (parks ?? []) as Park[]) {
    summary.parks += 1;

    try {
      const weather = await fetchWeather({
        days,
        lat: park.latitude,
        lng: park.longitude
      });

      const rows: WeatherInsert[] = weather.map((day) => ({
        forecast_date: day.forecastDate,
        park_id: park.id,
        precip_chance: day.precipChance,
        raw: day.raw,
        summary: day.summary,
        temp_high: day.tempHigh,
        temp_low: day.tempLow,
        weather_code: day.weatherCode
      }));

      if (rows.length === 0) {
        continue;
      }

      const { error: upsertError } = await supabase
        .from("weather_cache")
        .upsert(rows, {
          onConflict: "park_id,forecast_date"
        });

      if (upsertError) {
        throw new Error(upsertError.message);
      }

      summary.upserted += rows.length;
    } catch (error) {
      summary.errors.push({
        message: errorMessage(error),
        parkSlug: park.slug,
        source: "weather"
      } satisfies IngestError);
    }
  }

  return summary;
}
