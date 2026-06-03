import { z } from "zod";

import { getRequiredServerEnv } from "@/lib/env";
import { fetchJson, SourceError } from "@/lib/sources/http";

const npsAlertSchema = z.object({
  id: z.string().optional(),
  category: z.string().default("Information"),
  title: z.string().default("Untitled alert"),
  description: z.string().nullable().optional(),
  url: z.string().nullable().optional()
});

const npsAlertsResponseSchema = z.object({
  data: z.array(npsAlertSchema).default([])
});

export type NpsAlert = {
  category: string;
  description: string | null;
  npsAlertId: string | null;
  title: string;
  url: string | null;
};

export async function fetchParkAlerts(parkCode: string): Promise<NpsAlert[]> {
  const { NPS_API_KEY } = getRequiredServerEnv(["NPS_API_KEY"] as const);
  const url = new URL("https://developer.nps.gov/api/v1/alerts");
  url.searchParams.set("parkCode", parkCode);
  url.searchParams.set("limit", "100");

  const json = await fetchJson(url.toString(), {
    headers: {
      "X-Api-Key": NPS_API_KEY
    },
    source: "NPS"
  });

  const parsed = npsAlertsResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new SourceError("NPS alerts response did not match schema", "NPS");
  }

  return parsed.data.data.map((alert) => ({
    category: alert.category,
    description: alert.description ?? null,
    npsAlertId: alert.id ?? null,
    title: alert.title,
    url: alert.url ?? null
  }));
}
