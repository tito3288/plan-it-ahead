import type { ForecastStatus } from "@/lib/forecast/config";

export type ForecastConfidence = "high" | "medium" | "low";
export type ForecastSource = "prediction" | "live" | "mixed";

export type ForecastLotPrediction = {
  arrive_by: string;
  level: ForecastStatus;
  lot_id: string;
  lot_name: string;
  note: string | null;
};

export type ForecastDayData = {
  confidence: ForecastConfidence;
  daily_plan: string[];
  headline: string | null;
  hourly_status: ForecastStatus[];
  is_seasonal_estimate: boolean;
  lot_predictions: ForecastLotPrediction[];
  source: ForecastSource;
  weather_code: number | null;
  weather_summary: string | null;
};

export type ForecastDay = {
  date: string;
  forecast: ForecastDayData | null;
};

export type ForecastHighlight = {
  area: string;
  id: string;
  kind: "hike" | "landmark" | "viewpoint";
  name: string;
  planning_note: string;
  source_url: string | null;
  timing_label:
    | "Do early"
    | "Good backup"
    | "Anytime stop"
    | "Reservation-aware";
};

export type ForecastPark = {
  full_name: string;
  id: string;
  name: string;
  requires_reservation: boolean;
  reservation_note: string | null;
  slug: string;
};

export type ForecastSaveTrip = {
  endDate: string;
  forecastPath: string;
  initialSaved: boolean;
  isSignedIn: boolean;
  loginHref: string;
  startDate: string;
  title: string;
};

export type ForecastAlert = {
  category: string;
  description: string | null;
  id: string;
  title: string;
  url: string | null;
};
