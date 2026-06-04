import { NextResponse } from "next/server";

import { getRequiredServerEnv } from "@/lib/env";
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
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
        error instanceof Error ? error.message : "Unknown forecast generation error",
      stage: "forecast"
    });
  }

  return NextResponse.json(summary);
}

export async function GET(request: Request) {
  return handleRefresh(request);
}

export async function POST(request: Request) {
  return handleRefresh(request);
}
