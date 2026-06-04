import { describe, expect, it } from "vitest";

import { normalizeSupabaseCookies } from "@/lib/supabase/cookies";

function base64Url(value: string) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function sessionCookie(exp: number) {
  const accessToken = [
    base64Url(JSON.stringify({ alg: "none" })),
    base64Url(JSON.stringify({ exp })),
    "signature"
  ].join(".");

  return `base64-${base64Url(
    JSON.stringify({
      access_token: accessToken,
      refresh_token: "refresh-token"
    })
  )}`;
}

describe("normalizeSupabaseCookies", () => {
  it("prefers a fresh duplicate auth cookie over an expired one", () => {
    const cookies = normalizeSupabaseCookies(
      [
        {
          name: "sb-krhtcphqjeinglrbkqby-auth-token",
          value: sessionCookie(100)
        },
        {
          name: "sb-krhtcphqjeinglrbkqby-auth-token",
          value: sessionCookie(200)
        }
      ],
      150
    );

    expect(cookies).toHaveLength(1);
    expect(cookies[0].value).toBe(sessionCookie(200));
  });

  it("keeps the later duplicate when both auth cookies are usable", () => {
    const first = sessionCookie(250);
    const second = sessionCookie(300);
    const cookies = normalizeSupabaseCookies(
      [
        {
          name: "sb-krhtcphqjeinglrbkqby-auth-token",
          value: first
        },
        {
          name: "sb-krhtcphqjeinglrbkqby-auth-token",
          value: second
        }
      ],
      150
    );

    expect(cookies).toHaveLength(1);
    expect(cookies[0].value).toBe(second);
  });
});
