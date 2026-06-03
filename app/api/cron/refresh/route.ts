import { NextResponse } from "next/server";

import { getRequiredServerEnv } from "@/lib/env";
import { runAll } from "@/lib/ingest/runAll";

function isAuthorized(request: Request) {
  const { CRON_SECRET } = getRequiredServerEnv(["CRON_SECRET"] as const);
  const authorization = request.headers.get("authorization");

  return authorization === `Bearer ${CRON_SECRET}`;
}

async function handleRefresh(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await runAll();

  // TODO(phase-4): generate daily_forecast here after ingestion completes.

  return NextResponse.json(summary);
}

export async function GET(request: Request) {
  return handleRefresh(request);
}

export async function POST(request: Request) {
  return handleRefresh(request);
}
