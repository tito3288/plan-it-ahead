import { unstable_noStore as noStore } from "next/cache";

import { createClient } from "@/lib/supabase/server";

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

export function safeRedirectPath(path: string | null | undefined) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }

  return path;
}
