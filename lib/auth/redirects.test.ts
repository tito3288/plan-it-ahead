import { describe, expect, it } from "vitest";

import {
  buildAuthCallbackUrlFromSiteUrl,
  buildPasswordResetUrlFromSiteUrl,
  resolveSiteUrl
} from "@/lib/auth/redirects";

describe("resolveSiteUrl", () => {
  it("uses NEXT_PUBLIC_SITE_URL in production instead of the request origin", () => {
    expect(
      resolveSiteUrl({
        configuredSiteUrl: "https://planitahead.com/",
        nodeEnv: "production",
        requestOrigin: "http://localhost:8080"
      })
    ).toBe("https://planitahead.com");
  });

  it("builds production magic-link callbacks on planitahead.com", () => {
    expect(
      buildAuthCallbackUrlFromSiteUrl(
        "/plan/rocky-mountain/forecast?start=2026-06-06&end=2026-06-08",
        "https://planitahead.com"
      )
    ).toBe(
      "https://planitahead.com/auth/callback?next=%2Fplan%2Frocky-mountain%2Fforecast%3Fstart%3D2026-06-06%26end%3D2026-06-08"
    );
  });

  it("builds production password reset redirects on planitahead.com", () => {
    expect(
      buildPasswordResetUrlFromSiteUrl("/trips", "https://planitahead.com")
    ).toBe("https://planitahead.com/auth/reset?next=%2Ftrips");
  });

  it("falls back to the request origin only outside production", () => {
    expect(
      resolveSiteUrl({
        configuredSiteUrl: "",
        nodeEnv: "development",
        requestOrigin: "http://localhost:3000"
      })
    ).toBe("http://localhost:3000");
  });

  it("throws in production when the site URL is missing", () => {
    expect(() =>
      resolveSiteUrl({
        configuredSiteUrl: "",
        nodeEnv: "production",
        requestOrigin: "http://localhost:8080"
      })
    ).toThrow("Missing NEXT_PUBLIC_SITE_URL");
  });
});
