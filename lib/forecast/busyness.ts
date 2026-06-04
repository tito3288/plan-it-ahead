import { forecastConfig } from "@/lib/forecast/config";

export type ScoreWeather = {
  precipChance: number | null;
  tempHigh: number | null;
  weatherCode: number | null;
} | null;

type ComputeDailyScoreInput = {
  isHoliday: boolean;
  isWeekend: boolean;
  relativeBusyness: number;
  weather: ScoreWeather;
};

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function weatherAdjustment(weather: ScoreWeather) {
  if (!weather) {
    return 0;
  }

  const code = weather.weatherCode;
  const tempHigh = weather.tempHigh;
  const precipChance = weather.precipChance ?? 0;
  const config = forecastConfig.weather;
  let adjustment = 0;

  if (code !== null && (config.clearCodes as readonly number[]).includes(code)) {
    adjustment += config.clearWarmBoost;
  }

  if (code !== null && (config.rainCodes as readonly number[]).includes(code)) {
    adjustment -= Math.min(config.rainPenaltyMax, precipChance / 100 / 4);
  }

  if (code !== null && (config.snowCodes as readonly number[]).includes(code)) {
    adjustment -= config.snowPenalty;
  }

  if (tempHigh !== null && tempHigh < config.coldHighTempF) {
    adjustment -= config.coldPenalty;
  }

  if (tempHigh !== null && tempHigh > config.hotHighTempF) {
    adjustment -= config.hotPenalty;
  }

  return adjustment;
}

export function computeDailyScore({
  isHoliday,
  isWeekend,
  relativeBusyness,
  weather
}: ComputeDailyScoreInput) {
  let score = relativeBusyness;

  if (isWeekend) {
    score *= forecastConfig.weekendMultiplier;
  }

  if (isHoliday) {
    score *= forecastConfig.holidayMultiplier;
  }

  score += weatherAdjustment(weather);

  return clamp01(score);
}
