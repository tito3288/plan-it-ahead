import { createAdminClient } from "@/lib/supabase/admin";
import { fetchParkAlerts } from "@/lib/sources/nps";
import type { IngestError, SyncAlertsSummary } from "@/lib/ingest/types";
import type { Tables, TablesInsert } from "@/types/database";

type Park = Pick<Tables<"parks">, "id" | "nps_park_code" | "slug">;
type AlertInsert = TablesInsert<"alerts">;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown alerts sync error";
}

export async function syncAlerts(): Promise<SyncAlertsSummary> {
  const supabase = createAdminClient();
  const summary: SyncAlertsSummary = {
    deleted: 0,
    errors: [],
    parks: 0,
    received: 0,
    upserted: 0
  };

  const { data: parks, error: parksError } = await supabase
    .from("parks")
    .select("id,nps_park_code,slug")
    .eq("is_active", true);

  if (parksError) {
    throw new Error(parksError.message);
  }

  for (const park of (parks ?? []) as Park[]) {
    summary.parks += 1;

    try {
      const alerts = await fetchParkAlerts(park.nps_park_code);
      const seenAlertIds = alerts.map(
        (alert) => alert.npsAlertId ?? `${park.nps_park_code}:${alert.title}`
      );
      summary.received += alerts.length;

      if (alerts.length > 0) {
        const rows: AlertInsert[] = alerts.map((alert) => ({
          category: alert.category,
          description: alert.description,
          last_seen_at: new Date().toISOString(),
          nps_alert_id:
            alert.npsAlertId ?? `${park.nps_park_code}:${alert.title}`,
          park_id: park.id,
          title: alert.title,
          url: alert.url
        }));

        const { error: upsertError } = await supabase.from("alerts").upsert(rows, {
          onConflict: "park_id,nps_alert_id"
        });

        if (upsertError) {
          throw new Error(upsertError.message);
        }

        summary.upserted += rows.length;
      }

      const { data: existingAlerts, error: existingError } = await supabase
        .from("alerts")
        .select("id,nps_alert_id")
        .eq("park_id", park.id);

      if (existingError) {
        throw new Error(existingError.message);
      }

      const staleIds = ((existingAlerts ?? []) as Array<{
        id: string;
        nps_alert_id: string | null;
      }>)
        .filter(
          (alert) =>
            alert.nps_alert_id !== null && !seenAlertIds.includes(alert.nps_alert_id)
        )
        .map((alert) => alert.id);

      for (const alertId of staleIds) {
        const { error: deleteError } = await supabase
          .from("alerts")
          .delete()
          .eq("id", alertId);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        summary.deleted += 1;
      }
    } catch (error) {
      summary.errors.push({
        message: errorMessage(error),
        parkSlug: park.slug,
        source: "alerts"
      } satisfies IngestError);
    }
  }

  return summary;
}
