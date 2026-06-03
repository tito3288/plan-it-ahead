export type IngestError = {
  message: string;
  parkSlug?: string;
  source: "alerts" | "facilities" | "weather";
};

export type SyncAlertsSummary = {
  deleted: number;
  errors: IngestError[];
  parks: number;
  received: number;
  upserted: number;
};

export type FacilityMatch = {
  facilities: Array<{
    id: string;
    name: string;
    type: string | null;
  }>;
  facilityIds: string[];
  parkSlug: string;
};

export type SyncFacilitiesSummary = {
  errors: IngestError[];
  matches: FacilityMatch[];
  noMatches: string[];
  parks: number;
  updated: number;
};

export type SyncWeatherSummary = {
  days: number;
  errors: IngestError[];
  parks: number;
  upserted: number;
};

export type RunAllSummary = {
  alerts: SyncAlertsSummary | null;
  errors: IngestError[];
  facilities: SyncFacilitiesSummary | null;
  weather: SyncWeatherSummary | null;
};
