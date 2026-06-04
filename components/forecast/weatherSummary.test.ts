import { describe, expect, it } from "vitest";

import { formatWeatherSummary } from "@/components/forecast/weatherSummary";

describe("formatWeatherSummary", () => {
  it("converts Fahrenheit weather labels to Celsius for display", () => {
    expect(formatWeatherSummary("Clear, 78°F")).toBe("Clear, 26°C");
    expect(formatWeatherSummary("Weather, 4°F")).toBe("Weather, -16°C");
  });

  it("leaves labels without Fahrenheit unchanged", () => {
    expect(formatWeatherSummary("Cloudy")).toBe("Cloudy");
    expect(formatWeatherSummary(null)).toBeNull();
  });
});
