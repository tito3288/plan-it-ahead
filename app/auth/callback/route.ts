import { NextResponse, type NextRequest } from "next/server";

import { buildAppRedirectUrl } from "@/lib/auth/redirects";
import { safeRedirectPath } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const requestOrigin = requestUrl.origin;
  const code = requestUrl.searchParams.get("code");
  const next = safeRedirectPath(
    requestUrl.searchParams.get("next") ??
      requestUrl.searchParams.get("redirect")
  );

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(buildAppRedirectUrl(next, requestOrigin));
    }
  }

  const loginUrl = buildAppRedirectUrl("/login", requestOrigin);
  loginUrl.searchParams.set("next", next);
  loginUrl.searchParams.set("error", "We could not finish signing you in.");

  return NextResponse.redirect(loginUrl);
}
