type NamedCookie = {
  name: string;
  value: string;
};

function isSupabaseAuthCookie(name: string) {
  return name.startsWith("sb-") && name.includes("-auth-token");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);

  return atob(`${normalized}${padding}`);
}

function decodeCookieJson(value: string) {
  try {
    const encoded = value.startsWith("base64-") ? value.slice(7) : value;

    return JSON.parse(base64UrlDecode(encoded)) as unknown;
  } catch {
    return null;
  }
}

function decodeJwtExp(token: string) {
  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as {
      exp?: unknown;
    };

    return typeof parsed.exp === "number" ? parsed.exp : null;
  } catch {
    return null;
  }
}

function cookieScore(cookie: NamedCookie, nowSeconds: number) {
  if (!cookie.value) {
    return 0;
  }

  const value = decodeCookieJson(cookie.value);

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return 1;
  }

  const accessToken = "access_token" in value ? value.access_token : null;
  const refreshToken = "refresh_token" in value ? value.refresh_token : null;
  const exp =
    typeof accessToken === "string" ? decodeJwtExp(accessToken) : null;

  if (exp !== null && exp > nowSeconds) {
    return 4;
  }

  if (typeof refreshToken === "string" && refreshToken.length > 0) {
    return 2;
  }

  return 1;
}

export function normalizeSupabaseCookies<TCookie extends NamedCookie>(
  cookies: TCookie[],
  nowSeconds = Math.floor(Date.now() / 1000)
) {
  const normalized: TCookie[] = [];
  const indexesByName = new Map<string, number>();

  for (const cookie of cookies) {
    if (!isSupabaseAuthCookie(cookie.name)) {
      normalized.push(cookie);
      continue;
    }

    const existingIndex = indexesByName.get(cookie.name);

    if (existingIndex === undefined) {
      indexesByName.set(cookie.name, normalized.length);
      normalized.push(cookie);
      continue;
    }

    const existing = normalized[existingIndex];
    const existingScore = cookieScore(existing, nowSeconds);
    const nextScore = cookieScore(cookie, nowSeconds);

    if (nextScore >= existingScore) {
      normalized[existingIndex] = cookie;
    }
  }

  return normalized;
}
