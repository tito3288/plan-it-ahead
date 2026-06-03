import { createAdminClient } from "@/lib/supabase/admin";
import type {
  FacilityMatch,
  IngestError,
  SyncFacilitiesSummary
} from "@/lib/ingest/types";
import { findParkFacilities } from "@/lib/sources/recreation";
import type { Tables } from "@/types/database";

type Park = Pick<Tables<"parks">, "full_name" | "id" | "latitude" | "longitude" | "slug">;

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Unknown facilities sync error";
}

export async function syncFacilities(): Promise<SyncFacilitiesSummary> {
  const supabase = createAdminClient();
  const summary: SyncFacilitiesSummary = {
    errors: [],
    matches: [],
    noMatches: [],
    parks: 0,
    updated: 0
  };

  const { data: parks, error: parksError } = await supabase
    .from("parks")
    .select("full_name,id,latitude,longitude,slug")
    .eq("is_active", true);

  if (parksError) {
    throw new Error(parksError.message);
  }

  for (const park of (parks ?? []) as Park[]) {
    summary.parks += 1;

    try {
      const facilities = await findParkFacilities({
        lat: park.latitude,
        lng: park.longitude,
        name: park.full_name
      });
      const topFacilities = facilities.slice(0, 5);
      const facilityIds = topFacilities.map((facility) => facility.id);

      const { error: updateError } = await supabase
        .from("parks")
        .update({
          ridb_facility_ids: facilityIds.length > 0 ? facilityIds : null
        })
        .eq("id", park.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      if (facilityIds.length === 0) {
        summary.noMatches.push(park.slug);
      } else {
        const match: FacilityMatch = {
          facilities: topFacilities,
          facilityIds,
          parkSlug: park.slug
        };
        summary.matches.push(match);
        console.info(
          `[RIDB] ${park.slug}: ${topFacilities
            .map((facility) => `${facility.name} (${facility.id})`)
            .join(", ")}`
        );
      }

      summary.updated += 1;
    } catch (error) {
      summary.errors.push({
        message: errorMessage(error),
        parkSlug: park.slug,
        source: "facilities"
      } satisfies IngestError);
    }
  }

  return summary;
}
