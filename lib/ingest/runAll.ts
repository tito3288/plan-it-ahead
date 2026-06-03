import { syncAlerts } from "@/lib/ingest/syncAlerts";
import { syncFacilities } from "@/lib/ingest/syncFacilities";
import { syncWeather } from "@/lib/ingest/syncWeather";
import type { IngestError, RunAllSummary } from "@/lib/ingest/types";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown ingestion error";
}

export async function runAll(): Promise<RunAllSummary> {
  const summary: RunAllSummary = {
    alerts: null,
    errors: [],
    facilities: null,
    weather: null
  };

  try {
    summary.alerts = await syncAlerts();
    summary.errors.push(...summary.alerts.errors);
  } catch (error) {
    summary.errors.push({
      message: errorMessage(error),
      source: "alerts"
    } satisfies IngestError);
  }

  try {
    summary.facilities = await syncFacilities();
    summary.errors.push(...summary.facilities.errors);
  } catch (error) {
    summary.errors.push({
      message: errorMessage(error),
      source: "facilities"
    } satisfies IngestError);
  }

  try {
    summary.weather = await syncWeather();
    summary.errors.push(...summary.weather.errors);
  } catch (error) {
    summary.errors.push({
      message: errorMessage(error),
      source: "weather"
    } satisfies IngestError);
  }

  return summary;
}
