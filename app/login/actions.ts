"use server";

import { redirect } from "next/navigation";

import { buildAuthCallbackUrl } from "@/lib/auth/redirects";
import { safeRedirectPath } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type PasswordAuthState = {
  message: string | null;
  redirectTo: string | null;
  status: "idle" | "sent" | "signedIn" | "error";
  submittedEmail: string | null;
};

export type LoginState = {
  message: string | null;
  redirectTo: string | null;
  status: "idle" | "sent" | "error";
  submittedEmail: string | null;
};

const minimumPasswordLength = 8;

function fieldValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function passwordValue(formData: FormData) {
  const value = formData.get("password");

  return typeof value === "string" ? value : "";
}

function invalidEmailState(): PasswordAuthState {
  return {
    message: "Enter a valid email address.",
    redirectTo: null,
    status: "error",
    submittedEmail: null
  };
}

function invalidPasswordState(email: string): PasswordAuthState {
  return {
    message: "Use at least 8 characters for your password.",
    redirectTo: null,
    status: "error",
    submittedEmail: email
  };
}

function authErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("email not confirmed")) {
    return "Please confirm your email first, then sign in.";
  }

  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid credentials")
  ) {
    return "Email or password is incorrect.";
  }

  if (normalized.includes("already registered")) {
    return "That email already has an account. Try signing in instead.";
  }

  if (normalized.includes("password")) {
    return "Check your password and try again.";
  }

  return "We could not finish that request. Please try again.";
}

export async function signInWithPasswordAction(
  _state: PasswordAuthState,
  formData: FormData
): Promise<PasswordAuthState> {
  const email = fieldValue(formData, "email");
  const password = passwordValue(formData);
  const nextPath = safeRedirectPath(fieldValue(formData, "nextPath"));

  if (!email || !email.includes("@")) {
    return invalidEmailState();
  }

  if (password.length < minimumPasswordLength) {
    return invalidPasswordState(email);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return {
      message: authErrorMessage(error.message),
      redirectTo: null,
      status: "error",
      submittedEmail: email
    };
  }

  redirect(nextPath);
}

export async function signUpWithPasswordAction(
  _state: PasswordAuthState,
  formData: FormData
): Promise<PasswordAuthState> {
  const email = fieldValue(formData, "email");
  const password = passwordValue(formData);
  const nextPath = safeRedirectPath(fieldValue(formData, "nextPath"));

  if (!email || !email.includes("@")) {
    return invalidEmailState();
  }

  if (password.length < minimumPasswordLength) {
    return invalidPasswordState(email);
  }

  let redirectTo: string;

  try {
    redirectTo = buildAuthCallbackUrl(nextPath);
  } catch {
    return {
      message: "Sign up is not configured for this environment yet.",
      redirectTo: null,
      status: "error",
      submittedEmail: email
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo
    }
  });

  if (error) {
    return {
      message: authErrorMessage(error.message),
      redirectTo: null,
      status: "error",
      submittedEmail: email
    };
  }

  if (data.session) {
    redirect(nextPath);
  }

  return {
    message: "Check your email to confirm your account.",
    redirectTo,
    status: "sent",
    submittedEmail: email
  };
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
