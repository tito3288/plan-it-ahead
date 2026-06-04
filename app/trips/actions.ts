"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/session";
import { deleteSavedTrip } from "@/lib/queries/parks";

export async function deleteTripAction(formData: FormData) {
  const user = await getCurrentUser();
  const tripId = formData.get("tripId");

  if (!user || typeof tripId !== "string" || tripId.length === 0) {
    return;
  }

  await deleteSavedTrip(tripId, user.id);
  revalidatePath("/trips");
}
