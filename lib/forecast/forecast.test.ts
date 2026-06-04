import { describe, expect, it } from "vitest";

import { computeDailyScore } from "@/lib/forecast/busyness";
import { computeConfidence } from "@/lib/forecast/confidence";
import { buildHourlyStatus } from "@/lib/forecast/curve";
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

  it("drops for far-out weatherless forecasts", () => {
    expect(
      computeConfidence({
        dataTier: 3,
        daysOut: 13,
        hasWeather: false
      })
    ).toBe("low");
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
});
