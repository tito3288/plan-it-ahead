"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/session";
import {
  createSavedTrip,
  findSavedTrip,
  type SavedTrip
} from "@/lib/queries/parks";

export type SaveTripState = {
  message: string | null;
  status: "idle" | "saved" | "error";
  tripId: string | null;
};

function fieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function isIsoDate(value: string | null): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function savedState(trip: SavedTrip): SaveTripState {
  return {
    message: "Saved. View it in My Trips.",
    status: "saved",
    tripId: trip.id
  };
}

export async function saveTripAction(
  _state: SaveTripState,
  formData: FormData
): Promise<SaveTripState> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      message: "Please sign in first, then save this trip.",
      status: "error",
      tripId: null
    };
  }

  const parkId = fieldValue(formData, "parkId");
  const startDate = fieldValue(formData, "startDate");
  const endDate = fieldValue(formData, "endDate");
  const title = fieldValue(formData, "title");
  const forecastPath = fieldValue(formData, "forecastPath");

  if (!parkId || !isIsoDate(startDate) || (endDate && !isIsoDate(endDate))) {
    return {
      message: "We could not save those trip dates. Please try again.",
      status: "error",
      tripId: null
    };
  }

  try {
    const normalizedEndDate = endDate && endDate !== startDate ? endDate : null;
    const existing = await findSavedTrip({
      endDate: normalizedEndDate,
      parkId,
      startDate,
      userId: user.id
    });

    if (existing) {
      return savedState(existing);
    }

    const trip = await createSavedTrip({
      end_date: normalizedEndDate,
      park_id: parkId,
      start_date: startDate,
      title,
      user_id: user.id
    });

    revalidatePath("/trips");

    if (forecastPath) {
      revalidatePath(forecastPath);
    }

    return savedState(trip);
  } catch {
    return {
      message: "We could not save this trip right now. Please try again.",
      status: "error",
      tripId: null
    };
  }
}
