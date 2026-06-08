"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import {
  createItinerary,
  createItineraryItem,
  deleteItinerary,
  deleteItineraryItem,
  getItineraryLinkForSavedTrip,
  getNextItineraryItemOrder
} from "@/lib/queries/itineraries";
import { getSavedTripWithParkById } from "@/lib/queries/parks";

function fieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function isIsoDate(value: string | null): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function itineraryPath(itineraryId: string) {
  return `/trips/itineraries/${itineraryId}`;
}

export async function createItineraryFromSavedTripAction(formData: FormData) {
  const user = await getCurrentUser();
  const savedTripId = fieldValue(formData, "savedTripId");

  if (!user || !savedTripId) {
    return;
  }

  const existingLink = await getItineraryLinkForSavedTrip({
    savedTripId,
    userId: user.id
  });

  if (existingLink) {
    redirect(itineraryPath(existingLink.itineraryId));
  }

  const savedTrip = await getSavedTripWithParkById({
    tripId: savedTripId,
    userId: user.id
  });

  if (!savedTrip) {
    return;
  }

  const itinerary = await createItinerary({
    end_date: savedTrip.end_date ?? savedTrip.start_date,
    notes: null,
    start_date: savedTrip.start_date,
    title: `${savedTrip.park.name} Itinerary`,
    user_id: user.id
  });

  await createItineraryItem({
    display_order: 0,
    item_date: savedTrip.start_date,
    item_type: "saved_trip",
    itinerary_id: itinerary.id,
    saved_trip_id: savedTrip.id
  });

  revalidatePath("/trips");
  redirect(itineraryPath(itinerary.id));
}

export async function addNoteToItineraryAction(formData: FormData) {
  const user = await getCurrentUser();
  const itineraryId = fieldValue(formData, "itineraryId");
  const itemDate = fieldValue(formData, "itemDate");
  const title = fieldValue(formData, "title");
  const notes = fieldValue(formData, "notes");

  if (!user || !itineraryId || !isIsoDate(itemDate) || !title) {
    return;
  }

  const displayOrder = await getNextItineraryItemOrder({
    itemDate,
    itineraryId
  });

  await createItineraryItem({
    display_order: displayOrder,
    item_date: itemDate,
    item_type: "note",
    itinerary_id: itineraryId,
    notes,
    title
  });

  revalidatePath(itineraryPath(itineraryId));
  revalidatePath("/trips");
}

export async function deleteItineraryItemAction(formData: FormData) {
  const user = await getCurrentUser();
  const itemId = fieldValue(formData, "itemId");
  const itineraryId = fieldValue(formData, "itineraryId");

  if (!user || !itemId || !itineraryId) {
    return;
  }

  await deleteItineraryItem(itemId);
  revalidatePath(itineraryPath(itineraryId));
}

export async function deleteItineraryAction(formData: FormData) {
  const user = await getCurrentUser();
  const itineraryId = fieldValue(formData, "itineraryId");

  if (!user || !itineraryId) {
    return;
  }

  await deleteItinerary(itineraryId, user.id);
  revalidatePath("/trips");
  redirect("/trips");
}
