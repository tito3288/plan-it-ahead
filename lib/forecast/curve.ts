import { forecastConfig, type ForecastStatus } from "@/lib/forecast/config";

function toStatus(value: number): ForecastStatus {
  if (value >= forecastConfig.statusThresholds.red) {
    return 2;
  }

  if (value >= forecastConfig.statusThresholds.amber) {
    return 1;
  }

  return 0;
}

export function buildHourlyStatus(dailyScore: number): ForecastStatus[] {
  return forecastConfig.baseDemandCurve.map((demand) =>
    toStatus(demand * dailyScore)
  );
}
