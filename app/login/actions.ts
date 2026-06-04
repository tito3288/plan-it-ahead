"use server";

import { buildAuthCallbackUrl } from "@/lib/auth/redirects";
import { safeRedirectPath } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  message: string | null;
  redirectTo: string | null;
  status: "idle" | "sent" | "error";
  submittedEmail: string | null;
};

function fieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function sendMagicLinkAction(
  _state: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = fieldValue(formData, "email");
  const nextPath = safeRedirectPath(fieldValue(formData, "nextPath"));

  if (!email || !email.includes("@")) {
    return {
      message: "Enter a valid email address.",
      redirectTo: null,
      status: "error",
      submittedEmail: null
    };
  }

  let redirectTo: string;

  try {
    redirectTo = buildAuthCallbackUrl(nextPath);
  } catch {
    return {
      message: "Sign in is not configured for this environment yet.",
      redirectTo: null,
      status: "error",
      submittedEmail: email
    };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo
    }
  });

  if (error) {
    return {
      message: "We could not send that link. Check the email and try again.",
      redirectTo,
      status: "error",
      submittedEmail: email
    };
  }

  return {
    message: "Check your email for a secure sign-in link.",
    redirectTo,
    status: "sent",
    submittedEmail: email
  };
}
