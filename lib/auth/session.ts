import { unstable_noStore as noStore } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type UserProfile = Pick<Tables<"profiles">, "display_name" | "id">;

export async function getCurrentUser() {
  noStore();

  const supabase = createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name,id")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data as UserProfile | null;
}

export function firstName(displayName: string | null | undefined) {
  const normalized = displayName?.trim();

  if (!normalized) {
    return null;
  }

  return normalized.split(/\s+/)[0] ?? null;
}

export function safeRedirectPath(path: string | null | undefined) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }

  return path;
}
