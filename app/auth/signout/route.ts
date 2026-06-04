import { NextResponse, type NextRequest } from "next/server";

import { buildAppRedirectUrl } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(
    buildAppRedirectUrl("/", new URL(request.url).origin)
  );
}
