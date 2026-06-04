"use server";

import { buildPasswordResetUrl } from "@/lib/auth/redirects";
import { safeRedirectPath } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type ForgotPasswordState = {
  message: string | null;
  status: "idle" | "sent" | "error";
  submittedEmail: string | null;
};

function fieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function requestPasswordResetAction(
  _state: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = fieldValue(formData, "email");
  const nextPath = safeRedirectPath(fieldValue(formData, "nextPath"));

  if (!email || !email.includes("@")) {
    return {
      message: "Enter a valid email address.",
      status: "error",
      submittedEmail: null
    };
  }

  let redirectTo: string;

  try {
    redirectTo = buildPasswordResetUrl(nextPath);
  } catch {
    return {
      message: "Password reset is not configured for this environment yet.",
      status: "error",
      submittedEmail: email
    };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo
  });

  if (error) {
    return {
      message: "We could not send that reset email. Try again in a moment.",
      status: "error",
      submittedEmail: email
    };
  }

  return {
    message: "Check your email for a password reset link.",
    status: "sent",
    submittedEmail: email
  };
}
