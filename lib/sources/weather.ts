import { z } from "zod";

import { fetchJson, SourceError } from "@/lib/sources/http";
import type { Json } from "@/types/database";

const weatherResponseSchema = z.object({
  daily: z.object({
    time: z.array(z.string()),
    temperature_2m_max: z.array(z.number().nullable()).default([]),
    temperature_2m_min: z.array(z.number().nullable()).default([]),
    precipitation_probability_max: z.array(z.number().nullable()).default([]),
    weather_code: z.array(z.number().nullable()).default([])
  })
});

export type DailyWeather = {
  forecastDate: string;
  precipChance: number | null;
  raw: Json;
  summary: string;
  tempHigh: number | null;
  tempLow: number | null;
  weatherCode: number | null;
};

type FetchWeatherInput = {
  days: number;
  lat: number;
  lng: number;
};

const weatherCodeLabels = new Map<number, string>([
  [0, "Clear"],
  [1, "Mostly clear"],
  [2, "Partly cloudy"],
  [3, "Cloudy"],
  [45, "Fog"],
  [48, "Fog"],
  [51, "Light drizzle"],
  [53, "Drizzle"],
  [55, "Heavy drizzle"],
  [61, "Light rain"],
  [63, "Rain"],
  [65, "Heavy rain"],
  [71, "Light snow"],
  [73, "Snow"],
  [75, "Heavy snow"],
  [80, "Rain showers"],
  [81, "Rain showers"],
  [82, "Heavy showers"],
  [95, "Thunderstorms"]
]);

function formatSummary(weatherCode: number | null, tempHigh: number | null) {
  const label =
    weatherCode === null ? "Weather" : (weatherCodeLabels.get(weatherCode) ?? "Weather");
  const temp = tempHigh === null ? "" : `, ${Math.round(tempHigh)}°F`;

  return `${label}${temp}`;
}

export async function fetchWeather({
  days,
  lat,
  lng
}: FetchWeatherInput): Promise<DailyWeather[]> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max"
    ].join(",")
  );
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", String(days));

  const json = await fetchJson(url.toString(), {
    source: "Open-Meteo"
  });

  const parsed = weatherResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new SourceError(
      "Open-Meteo weather response did not match schema",
      "Open-Meteo"
    );
  }

  const daily = parsed.data.daily;

  return daily.time.map((forecastDate, index) => {
    const tempHigh = daily.temperature_2m_max[index] ?? null;
    const tempLow = daily.temperature_2m_min[index] ?? null;
    const precipChance = daily.precipitation_probability_max[index] ?? null;
    const weatherCode = daily.weather_code[index] ?? null;

    return {
      forecastDate,
      precipChance,
      raw: {
        forecast_date: forecastDate,
        precip_chance: precipChance,
        temp_high: tempHigh,
        temp_low: tempLow,
        weather_code: weatherCode
      },
      summary: formatSummary(weatherCode, tempHigh),
      tempHigh,
      tempLow,
      weatherCode
    };
  });
}
