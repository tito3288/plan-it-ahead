import type { PostgrestError } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { Park, SavedTrip, SavedTripWithPark } from "@/lib/queries/parks";
import type { Tables, TablesInsert } from "@/types/database";

export type Itinerary = Tables<"itineraries">;
export type ItineraryInsert = TablesInsert<"itineraries">;
export type ItineraryItem = Tables<"itinerary_items">;
export type ItineraryItemInsert = TablesInsert<"itinerary_items">;

export type ItineraryItemWithSavedTrip = ItineraryItem & {
  savedTrip: SavedTripWithPark | null;
};

export type ItineraryWithItems = Itinerary & {
  items: ItineraryItemWithSavedTrip[];
};

export type SavedTripItineraryLink = {
  itineraryId: string;
  savedTripId: string;
};

type ItineraryInsertQuery = {
  insert(itinerary: ItineraryInsert): {
    select(columns: string): {
      single(): Promise<{
        data: Itinerary | null;
        error: PostgrestError | null;
      }>;
    };
  };
};

type ItineraryItemInsertQuery = {
  insert(item: ItineraryItemInsert): {
    select(columns: string): {
      single(): Promise<{
        data: ItineraryItem | null;
        error: PostgrestError | null;
      }>;
    };
  };
};

type ItineraryItemRow = ItineraryItem & {
  saved_trips:
    | (SavedTrip & {
        parks: Park;
      })
    | null;
};

type ItineraryItemWithParentRow = Pick<
  ItineraryItem,
  "created_at" | "saved_trip_id"
> & {
  itineraries: Pick<Itinerary, "id"> | null;
};

function throwIfError(error: PostgrestError | null) {
  if (error) {
    throw new Error(error.message);
  }
}

function adaptItem(row: ItineraryItemRow): ItineraryItemWithSavedTrip {
  const { saved_trips: savedTrip, ...item } = row;

  return {
    ...item,
    savedTrip: savedTrip
      ? {
          ...savedTrip,
          park: savedTrip.parks
        }
      : null
  };
}

export async function getItineraries(userId: string): Promise<Itinerary[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("itineraries")
    .select("*")
    .eq("user_id", userId)
    .order("start_date", { ascending: true })
    .order("created_at", { ascending: true });

  throwIfError(error);

  return (data ?? []) as Itinerary[];
}

export async function getItineraryLinksForSavedTrips({
  savedTripIds,
  userId
}: {
  savedTripIds: string[];
  userId: string;
}): Promise<SavedTripItineraryLink[]> {
  if (savedTripIds.length === 0) {
    return [];
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("itinerary_items")
    .select("saved_trip_id, created_at, itineraries!inner(id, user_id)")
    .eq("item_type", "saved_trip")
    .in("saved_trip_id", savedTripIds)
    .eq("itineraries.user_id", userId)
    .order("created_at", { ascending: true });

  throwIfError(error);

  const rows = (data ?? []) as unknown as ItineraryItemWithParentRow[];
  const linksBySavedTripId = new Map<string, SavedTripItineraryLink>();

  for (const row of rows) {
    if (!row.saved_trip_id || !row.itineraries) {
      continue;
    }

    if (!linksBySavedTripId.has(row.saved_trip_id)) {
      linksBySavedTripId.set(row.saved_trip_id, {
        itineraryId: row.itineraries.id,
        savedTripId: row.saved_trip_id
      });
    }
  }

  return Array.from(linksBySavedTripId.values());
}

export async function getItineraryLinkForSavedTrip({
  savedTripId,
  userId
}: {
  savedTripId: string;
  userId: string;
}): Promise<SavedTripItineraryLink | null> {
  const links = await getItineraryLinksForSavedTrips({
    savedTripIds: [savedTripId],
    userId
  });

  return links[0] ?? null;
}

export async function getItineraryWithItems(
  itineraryId: string,
  userId: string
): Promise<ItineraryWithItems | null> {
  const supabase = createClient();

  const { data: itineraryData, error: itineraryError } = await supabase
    .from("itineraries")
    .select("*")
    .eq("id", itineraryId)
    .eq("user_id", userId)
    .maybeSingle();

  throwIfError(itineraryError);

  const itinerary = itineraryData as Itinerary | null;

  if (!itinerary) {
    return null;
  }

  const { data: itemData, error: itemError } = await supabase
    .from("itinerary_items")
    .select("*, saved_trips(*, parks(*))")
    .eq("itinerary_id", itinerary.id)
    .order("item_date", { ascending: true })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  throwIfError(itemError);

  const items = ((itemData ?? []) as unknown as ItineraryItemRow[]).map(
    adaptItem
  );

  return {
    ...itinerary,
    items
  };
}

export async function createItinerary(
  itinerary: ItineraryInsert
): Promise<Itinerary> {
  const supabase = createClient();
  const itineraries = supabase.from(
    "itineraries"
  ) as unknown as ItineraryInsertQuery;

  const { data, error } = await itineraries
    .insert(itinerary)
    .select("*")
    .single();

  throwIfError(error);

  if (!data) {
    throw new Error("Itinerary insert did not return a row.");
  }

  return data;
}

export async function createItineraryItem(
  item: ItineraryItemInsert
): Promise<ItineraryItem> {
  const supabase = createClient();
  const itineraryItems = supabase.from(
    "itinerary_items"
  ) as unknown as ItineraryItemInsertQuery;

  const { data, error } = await itineraryItems
    .insert(item)
    .select("*")
    .single();

  throwIfError(error);

  if (!data) {
    throw new Error("Itinerary item insert did not return a row.");
  }

  return data;
}

export async function getNextItineraryItemOrder({
  itemDate,
  itineraryId
}: {
  itemDate: string;
  itineraryId: string;
}): Promise<number> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("itinerary_items")
    .select("display_order")
    .eq("itinerary_id", itineraryId)
    .eq("item_date", itemDate)
    .order("display_order", { ascending: false })
    .limit(1);

  throwIfError(error);

  const rows = (data ?? []) as { display_order: number }[];
  const lastOrder = rows[0]?.display_order;

  return typeof lastOrder === "number" ? lastOrder + 1 : 0;
}

export async function deleteItineraryItem(itemId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("itinerary_items")
    .delete()
    .eq("id", itemId);

  throwIfError(error);
}

export async function deleteItinerary(
  itineraryId: string,
  userId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("itineraries")
    .delete()
    .eq("id", itineraryId)
    .eq("user_id", userId);

  throwIfError(error);
}
