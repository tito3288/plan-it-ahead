import { describe, expect, it } from "vitest";

import { getNextDateRange, isDateInRange } from "./calendarRange";

describe("calendar range selection", () => {
  it("selects a multi-day range from the first and second taps", () => {
    const today = "2026-06-04";

    const started = getNextDateRange(
      { end: null, start: null },
      "2026-06-10",
      today
    );
    const selected = getNextDateRange(started, "2026-06-14", today);

    expect(selected).toEqual({
      end: "2026-06-14",
      start: "2026-06-10"
    });
    expect(isDateInRange(selected, "2026-06-11")).toBe(true);
    expect(isDateInRange(selected, "2026-06-12")).toBe(true);
    expect(isDateInRange(selected, "2026-06-13")).toBe(true);
    expect(isDateInRange(selected, "2026-06-10")).toBe(false);
    expect(isDateInRange(selected, "2026-06-14")).toBe(false);
  });

  it("extends an existing range when a later date is tapped", () => {
    const selected = getNextDateRange(
      { end: "2026-06-11", start: "2026-06-10" },
      "2026-06-14",
      "2026-06-04"
    );

    expect(selected).toEqual({
      end: "2026-06-14",
      start: "2026-06-10"
    });
  });

  it("starts over when the completed range start or an earlier date is tapped", () => {
    const selected = getNextDateRange(
      { end: "2026-06-14", start: "2026-06-10" },
      "2026-06-08",
      "2026-06-04"
    );

    expect(selected).toEqual({
      end: null,
      start: "2026-06-08"
    });
  });
});
