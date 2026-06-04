import { describe, expect, it } from "vitest";

import { computeDailyScore } from "@/lib/forecast/busyness";
import { computeConfidence } from "@/lib/forecast/confidence";
import { forecastConfig } from "@/lib/forecast/config";
import { buildHourlyStatus } from "@/lib/forecast/curve";
import {
  buildForecastDateWindow,
  buildForecastRow,
  type ParkForecastContext
} from "@/lib/forecast/generate";
import { predictLots, type ForecastLot } from "@/lib/forecast/lots";
import { buildDailyPlan, buildHeadline } from "@/lib/forecast/plan";

const lots: ForecastLot[] = [
  {
    id: "lot-1",
    name: "Main Valley",
    note: "Fills early",
    typical_fill_hour: 9
  },
  {
    id: "lot-2",
    name: "Quiet Overlook",
    note: null,
    typical_fill_hour: null
  }
];

describe("computeDailyScore", () => {
  it("raises weekend demand above weekday demand", () => {
    const weekday = computeDailyScore({
      isHoliday: false,
      isWeekend: false,
      relativeBusyness: 0.6,
      weather: null
    });
    const weekend = computeDailyScore({
      isHoliday: false,
      isWeekend: true,
      relativeBusyness: 0.6,
      weather: null
    });

    expect(weekend).toBeGreaterThan(weekday);
  });

  it("lowers score for rain and clamps to 0-1", () => {
    const clear = computeDailyScore({
      isHoliday: false,
      isWeekend: false,
      relativeBusyness: 0.7,
      weather: {
        precipChance: 0,
        tempHigh: 78,
        weatherCode: 0
      }
    });
    const rainy = computeDailyScore({
      isHoliday: false,
      isWeekend: false,
      relativeBusyness: 0.7,
      weather: {
        precipChance: 90,
        tempHigh: 52,
        weatherCode: 63
      }
    });
    const clamped = computeDailyScore({
      isHoliday: true,
      isWeekend: true,
      relativeBusyness: 1.2,
      weather: {
        precipChance: 0,
        tempHigh: 82,
        weatherCode: 0
      }
    });

    expect(rainy).toBeLessThan(clear);
    expect(clamped).toBe(1);
  });
});

describe("forecast window", () => {
  it("builds the configured full forecast window", () => {
    expect(forecastConfig.forecastWindowDays).toBe(90);
    expect(buildForecastDateWindow()).toHaveLength(
      forecastConfig.forecastWindowDays
    );
  });
});

describe("buildHourlyStatus", () => {
  it("returns 14 slots and only status values", () => {
    const statuses = buildHourlyStatus(0.7);

    expect(statuses).toHaveLength(14);
    expect(statuses.every((status) => [0, 1, 2].includes(status))).toBe(true);
  });

  it("produces red hours for high scores and no red for low scores", () => {
    expect(buildHourlyStatus(0.9).some((status) => status === 2)).toBe(true);
    expect(buildHourlyStatus(0.3).some((status) => status === 2)).toBe(false);
  });

  it("peaks around late morning and midday", () => {
    const statuses = buildHourlyStatus(0.85);
    const peak = Math.max(...statuses);

    expect(statuses[0]).toBeLessThan(peak);
    expect(statuses[6]).toBe(peak);
    expect(statuses[13]).toBeLessThan(peak);
  });
});

describe("predictLots", () => {
  it("moves arrive-by earlier on busier days", () => {
    const calmer = predictLots(lots, 0.65, buildHourlyStatus(0.65), "America/Denver");
    const busier = predictLots(lots, 0.95, buildHourlyStatus(0.95), "America/Denver");

    expect(busier[0].arrive_by).not.toBe("Anytime");
    expect(calmer[0].arrive_by).not.toBe("Anytime");
    expect(busier[0].arrive_by).toBe("7:05 AM");
    expect(calmer[0].arrive_by).toBe("7:32 AM");
  });

  it("returns Anytime and level 0 for calm lots", () => {
    const predictions = predictLots(lots, 0.25, buildHourlyStatus(0.25), "America/Denver");

    expect(predictions[0].arrive_by).toBe("Anytime");
    expect(predictions[0].level).toBe(0);
  });
});

describe("computeConfidence", () => {
  it("is high for tier 1, near-term, weather-backed forecasts", () => {
    expect(
      computeConfidence({
        dataTier: 1,
        daysOut: 2,
        hasWeather: true
      })
    ).toBe("high");
  });

  it("is medium for weatherless forecasts up to 30 days out", () => {
    expect(
      computeConfidence({
        dataTier: 1,
        daysOut: 30,
        hasWeather: false
      })
    ).toBe("medium");
  });

  it("drops to low for weatherless forecasts more than 30 days out", () => {
    expect(
      computeConfidence({
        dataTier: 1,
        daysOut: 31,
        hasWeather: false
      })
    ).toBe("low");
  });

  it("never returns high without weather", () => {
    expect(
      computeConfidence({
        dataTier: 1,
        daysOut: 1,
        hasWeather: false
      })
    ).not.toBe("high");
  });
});

describe("realistic fixture cases", () => {
  it("produces a busy July Saturday with red hours and early guidance", () => {
    const score = computeDailyScore({
      isHoliday: false,
      isWeekend: true,
      relativeBusyness: 0.95,
      weather: {
        precipChance: 5,
        tempHigh: 81,
        weatherCode: 0
      }
    });
    const hourlyStatus = buildHourlyStatus(score);
    const predictions = predictLots(lots, score, hourlyStatus, "America/Denver");
    const plan = buildDailyPlan({
      dailyScore: score,
      earliestArriveBy: predictions[0].arrive_by,
      hasAlert: true,
      hasReservation: true
    });

    expect(score).toBe(1);
    expect(hourlyStatus.filter((status) => status === 2).length).toBeGreaterThan(4);
    expect(predictions[0].arrive_by).toBe("7:00 AM");
    expect(buildHeadline(score, 6)).toContain("Busiest");
    expect(plan.length).toBeGreaterThanOrEqual(3);
    expect(plan.length).toBeLessThanOrEqual(4);
  });

  it("produces a calmer rainy October Tuesday fixture", () => {
    const score = computeDailyScore({
      isHoliday: false,
      isWeekend: false,
      relativeBusyness: 0.45,
      weather: {
        precipChance: 85,
        tempHigh: 48,
        weatherCode: 63
      }
    });
    const hourlyStatus = buildHourlyStatus(score);
    const predictions = predictLots(lots, score, hourlyStatus, "America/Denver");
    const plan = buildDailyPlan({
      dailyScore: score,
      earliestArriveBy: predictions[0].arrive_by,
      hasAlert: false,
      hasReservation: false
    });

    expect(score).toBeLessThan(0.45);
    expect(hourlyStatus.some((status) => status === 2)).toBe(false);
    expect(predictions[0].arrive_by).toBe("Anytime");
    expect(buildHeadline(score, 2)).toContain("Calmer");
    expect(plan.length).toBeGreaterThanOrEqual(2);
  });

  it("produces a far-out busy summer Saturday seasonal estimate", () => {
    const dates = Array.from({ length: 90 }, (_, index) => {
      const date = new Date(Date.UTC(2026, 5, 1 + index));

      return date.toISOString().slice(0, 10);
    });
    const context = {
      alertsCount: 0,
      history: [
        {
          dow: 6,
          month: 7,
          relative_busyness: 0.92
        }
      ],
      lots,
      park: {
        data_tier: 1,
        id: "park-1",
        requires_reservation: true,
        slug: "glacier",
        timezone: "America/Denver"
      },
      weather: [
        {
          forecast_date: "2026-07-18",
          precip_chance: 0,
          summary: "Weather should be ignored outside the horizon",
          temp_high: 82,
          temp_low: 55,
          weather_code: 0
        }
      ]
    } satisfies ParkForecastContext;

    const row = buildForecastRow(context, "2026-07-18", dates);

    expect(row.weather_summary).toBeNull();
    expect(row.confidence).toBe("low");
    expect(row.headline).toContain("Busiest");
    expect(row.lot_predictions).not.toBeNull();
  });
});
