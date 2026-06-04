import { NextResponse } from "next/server";

import {
  getRequiredProductionRuntimeEnv,
  getRequiredServerEnv
} from "@/lib/env";
import { generateAllForecasts } from "@/lib/forecast/generate";
import { runAll } from "@/lib/ingest/runAll";

type RefreshSummary = {
  errors: Array<{
    message: string;
    stage: "forecast";
  }>;
  forecast: Awaited<ReturnType<typeof generateAllForecasts>> | null;
  ingestion: Awaited<ReturnType<typeof runAll>> | null;
};

function isAuthorized(request: Request) {
  const { CRON_SECRET } = getRequiredServerEnv(["CRON_SECRET"] as const);
  const authorization = request.headers.get("authorization");

  return authorization === `Bearer ${CRON_SECRET}`;
}

async function handleRefresh(request: Request) {
  const startedAt = Date.now();

  if (!isAuthorized(request)) {
    console.warn("[cron.refresh] Unauthorized refresh attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  getRequiredProductionRuntimeEnv([
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SITE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NPS_API_KEY",
    "RIDB_API_KEY",
    "CRON_SECRET"
  ] as const);

  console.info("[cron.refresh] Starting ingestion and forecast refresh");

  const summary: RefreshSummary = {
    errors: [],
    forecast: null,
    ingestion: null
  };

  summary.ingestion = await runAll();

  try {
    summary.forecast = await generateAllForecasts();
  } catch (error) {
    summary.errors.push({
      message:
        error instanceof Error
          ? error.message
          : "Unknown forecast generation error",
      stage: "forecast"
    });
  }

  console.info("[cron.refresh] Completed refresh", {
    durationMs: Date.now() - startedAt,
    errors: summary.errors.length + (summary.ingestion?.errors.length ?? 0),
    forecastRows: summary.forecast?.rows ?? 0
  });

  return NextResponse.json(summary);
}

export async function GET(request: Request) {
  void request;

  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function POST(request: Request) {
  return handleRefresh(request);
}
