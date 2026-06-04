import { headers } from "next/headers";

import { safeRedirectPath } from "@/lib/auth/session";
import { getServerEnv } from "@/lib/env";

type ResolveSiteUrlInput = {
  configuredSiteUrl?: string | null;
  nodeEnv?: string;
  requestOrigin?: string | null;
};

function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}

function requestOriginFromHeaders() {
  const headersList = headers();
  const host =
    headersList.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    headersList.get("host");

  if (!host) {
    return null;
  }

  const proto =
    headersList.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "http";

  return `${proto}://${host}`;
}

export function resolveSiteUrl({
  configuredSiteUrl,
  nodeEnv = process.env.NODE_ENV,
  requestOrigin
}: ResolveSiteUrlInput) {
  if (configuredSiteUrl) {
    return stripTrailingSlash(configuredSiteUrl);
  }

  if (nodeEnv === "production") {
    throw new Error(
      "Missing NEXT_PUBLIC_SITE_URL for production auth redirects."
    );
  }

  return stripTrailingSlash(requestOrigin ?? "http://localhost:3000");
}

export function getRuntimeSiteUrl(requestOrigin?: string | null) {
  const env = getServerEnv();

  return resolveSiteUrl({
    configuredSiteUrl: env.NEXT_PUBLIC_SITE_URL,
    requestOrigin: requestOrigin ?? requestOriginFromHeaders()
  });
}

export function buildAuthCallbackUrl(
  nextPath: string,
  requestOrigin?: string | null
) {
  return buildAuthCallbackUrlFromSiteUrl(
    nextPath,
    getRuntimeSiteUrl(requestOrigin)
  );
}

export function buildAuthCallbackUrlFromSiteUrl(
  nextPath: string,
  siteUrl: string
) {
  const url = new URL("/auth/callback", siteUrl);
  url.searchParams.set("next", safeRedirectPath(nextPath));

  return url.toString();
}

export function buildAppRedirectUrl(
  path: string,
  requestOrigin?: string | null
) {
  return new URL(safeRedirectPath(path), getRuntimeSiteUrl(requestOrigin));
}
