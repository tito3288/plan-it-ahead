export const forecastConfig = {
  // Forecast window written by generateAllForecasts.
  forecastWindowDays: 14,

  // Hour labels map to hourly_status slots: 6a through 7p.
  hourlySlots: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],

  // Baseline daily demand shape before the park/day score is applied.
  baseDemandCurve: [
    0.22, 0.34, 0.52, 0.7, 0.86, 0.96, 1, 0.98, 0.9, 0.78, 0.62, 0.48,
    0.34, 0.24
  ],

  // Thresholds convert scaled demand into green/amber/red UI status.
  statusThresholds: {
    amber: 0.45,
    red: 0.64
  },

  // Multipliers reflect demand patterns beyond monthly/dow baselines.
  weekendMultiplier: 1.08,
  holidayMultiplier: 1.16,

  // Weather nudges are intentionally modest; weather should tune, not dominate.
  weather: {
    clearCodes: [0, 1, 2],
    rainCodes: [51, 53, 55, 61, 63, 65, 80, 81, 82, 95],
    snowCodes: [71, 73, 75],
    clearWarmBoost: 0.05,
    rainPenaltyMax: 0.18,
    snowPenalty: 0.14,
    coldPenalty: 0.08,
    coldHighTempF: 45,
    hotPenalty: 0.05,
    hotHighTempF: 95
  },

  // Higher score shifts lot recommendations earlier.
  lots: {
    arriveByBufferMinutes: 30,
    maxBusyShiftMinutes: 90,
    calmScoreCutoff: 0.38
  },

  // Confidence thresholds are conservative by design.
  confidence: {
    nearTermDays: 7,
    farOutDays: 10
  }
} as const;

export type ForecastStatus = 0 | 1 | 2;
export type Confidence = "high" | "medium" | "low";
