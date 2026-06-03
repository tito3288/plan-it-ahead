import { z } from "zod";

import { getRequiredServerEnv } from "@/lib/env";
import { fetchJson, SourceError } from "@/lib/sources/http";

const ridbFacilitySchema = z.object({
  FacilityID: z.union([z.number(), z.string()]),
  FacilityName: z.string(),
  FacilityTypeDescription: z.string().nullable().optional()
});

const ridbFacilitiesResponseSchema = z.object({
  RECDATA: z.array(ridbFacilitySchema).default([])
});

export type RidbFacility = {
  id: string;
  name: string;
  type: string | null;
};

type FindParkFacilitiesInput = {
  lat: number;
  lng: number;
  name: string;
};

export async function findParkFacilities({
  lat,
  lng,
  name
}: FindParkFacilitiesInput): Promise<RidbFacility[]> {
  const { RIDB_API_KEY } = getRequiredServerEnv(["RIDB_API_KEY"] as const);
  const url = new URL("https://ridb.recreation.gov/api/v1/facilities");
  url.searchParams.set("query", name);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("radius", "50");
  url.searchParams.set("limit", "10");
  url.searchParams.set("offset", "0");
  url.searchParams.set("full", "false");

  const json = await fetchJson(url.toString(), {
    headers: {
      apikey: RIDB_API_KEY
    },
    source: "RIDB"
  });

  const parsed = ridbFacilitiesResponseSchema.safeParse(json);

  if (!parsed.success) {
    throw new SourceError("RIDB facilities response did not match schema", "RIDB");
  }

  return parsed.data.RECDATA.map((facility) => ({
    id: String(facility.FacilityID),
    name: facility.FacilityName,
    type: facility.FacilityTypeDescription ?? null
  }));
}
