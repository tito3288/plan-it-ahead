import { createClient } from "@supabase/supabase-js";

import { getRequiredServerEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("Supabase admin client cannot be used in the browser.");
  }

  const env = getRequiredServerEnv([
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY"
  ] as const);

  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
