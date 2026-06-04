import { NextResponse, type NextRequest } from "next/server";

import { buildAppRedirectUrl } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";

// Sign-out must be a POST: a GET endpoint that mutates the session can be
// triggered by link prefetching, browser preloading, or crawlers, which would
// silently log the user out. Using POST keeps it off the prefetch path.
export async function POST(request: NextRequest) {
  const supabase = createClient();
  await supabase.auth.signOut();

  // 303 so the browser issues a GET for the redirect target after the POST.
  return NextResponse.redirect(
    buildAppRedirectUrl("/", new URL(request.url).origin),
    { status: 303 }
  );
}
