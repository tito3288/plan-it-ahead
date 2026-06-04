"use client";

import { CheckCircle2, KeyRound, Mail } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import {
  sendMagicLinkAction,
  type LoginState
} from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type LoginFormProps = {
  errorMessage: string | null;
  nextPath: string;
};

type AuthMode = "signin" | "signup";

type PasswordStatus = "idle" | "sent" | "error" | "submitting";

const magicInitialState: LoginState = {
  message: null,
  redirectTo: null,
  status: "idle",
  submittedEmail: null
};

function buildClientAuthCallbackUrl(nextPath: string) {
  const url = new URL("/auth/callback", getSiteUrl());
  url.searchParams.set("next", nextPath);

  return url.toString();
}

function authErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("email not confirmed")) {
    return "Please confirm your email first, then log in.";
  }

  if (
    normalized.includes("invalid login credentials") ||
    normalized.includes("invalid credentials")
  ) {
    return "Email or password is incorrect.";
  }

  if (normalized.includes("already registered")) {
    return "That email already has an account. Try logging in instead.";
  }

  if (normalized.includes("password")) {
    return "Check your password and try again.";
  }

  return "We could not finish that request. Please try again.";
}

function SubmitButton({
  label,
  pendingLabel,
  pendingOverride = false
}: {
  label: string;
  pendingLabel: string;
  pendingOverride?: boolean;
}) {
  const { pending } = useFormStatus();
  const isPending = pending || pendingOverride;

  return (
    <Button className="w-full" disabled={isPending} type="submit">
      {isPending ? pendingLabel : label}
    </Button>
  );
}

function ModeButton({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full px-4 text-sm font-semibold transition",
        active
          ? "bg-green text-white"
          : "border border-border bg-white/60 text-green hover:border-green"
      )}
    >
      {children}
    </button>
  );
}

function SuccessState({
  email,
  message,
  title,
  type
}: {
  email: string | null;
  message: string;
  title: string;
  type: "confirm" | "magic";
}) {
  const Icon = type === "confirm" ? CheckCircle2 : Mail;

  return (
    <div className="text-center">
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-soft text-green">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-heading text-3xl font-semibold text-ink">
        {title}
      </h2>
      <p className="mt-3 text-base leading-7 text-ink-soft">
        {message}
        {email ? (
          <>
            {" "}
            We sent it to <span className="font-semibold text-ink">{email}</span>.
          </>
        ) : null}
      </p>
    </div>
  );
}

export function LoginForm({ errorMessage, nextPath }: LoginFormProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<PasswordStatus>(
    errorMessage ? "error" : "idle"
  );
  const [passwordMessage, setPasswordMessage] = useState<string | null>(
    errorMessage
  );
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [magicState, magicAction] = useFormState(
    sendMagicLinkAction,
    magicInitialState
  );

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const emailValue = formData.get("email");
    const passwordValue = formData.get("password");
    const email = typeof emailValue === "string" ? emailValue.trim() : "";
    const password = typeof passwordValue === "string" ? passwordValue : "";

    setSubmittedEmail(email || null);

    if (!email || !email.includes("@")) {
      setPasswordMessage("Enter a valid email address.");
      setPasswordStatus("error");
      return;
    }

    if (password.length < 8) {
      setPasswordMessage("Use at least 8 characters for your password.");
      setPasswordStatus("error");
      return;
    }

    setPasswordMessage(null);
    setPasswordStatus("submitting");

    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setPasswordMessage(authErrorMessage(error.message));
        setPasswordStatus("error");
        return;
      }

      window.location.assign(nextPath);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: buildClientAuthCallbackUrl(nextPath)
      }
    });

    if (error) {
      setPasswordMessage(authErrorMessage(error.message));
      setPasswordStatus("error");
      return;
    }

    if (data.session) {
      window.location.assign(nextPath);
      return;
    }

    setPasswordMessage("Check your email to confirm your account.");
    setPasswordStatus("sent");
  }

  if (passwordStatus === "sent") {
    return (
      <div className="rounded-[18px] border border-border bg-white/70 p-5 shadow-soft backdrop-blur-sm sm:p-6">
        <SuccessState
          email={submittedEmail}
          message="Open the confirmation link to activate your account and finish signing in."
          title="Confirm your email"
          type="confirm"
        />
      </div>
    );
  }

  if (magicState.status === "sent") {
    return (
      <div className="rounded-[18px] border border-border bg-white/70 p-5 shadow-soft backdrop-blur-sm sm:p-6">
        <SuccessState
          email={magicState.submittedEmail}
          message="Open the secure sign-in link on this device to finish signing in."
          title="Check your email"
          type="magic"
        />
      </div>
    );
  }

  return (
    <div className="rounded-[18px] border border-border bg-white/70 p-5 shadow-soft backdrop-blur-sm sm:p-6">
      <div className="grid grid-cols-2 gap-2">
        <ModeButton
          active={mode === "signin"}
          onClick={() => {
            setMode("signin");
            setShowMagicLink(false);
          }}
        >
          Log in
        </ModeButton>
        <ModeButton
          active={mode === "signup"}
          onClick={() => {
            setMode("signup");
            setShowMagicLink(false);
          }}
        >
          Sign up
        </ModeButton>
      </div>

      <div className="mt-6">
        {!showMagicLink ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input name="nextPath" type="hidden" value={nextPath} />
            <label className="block">
              <span className="text-sm font-semibold text-ink">Email</span>
              <input
                autoComplete="email"
                className="focus:ring-green/15 mt-2 min-h-12 w-full rounded-full border border-border bg-white/75 px-4 text-base text-ink outline-none transition focus:border-green focus:ring-2"
                inputMode="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-ink">Password</span>
              <input
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                className="focus:ring-green/15 mt-2 min-h-12 w-full rounded-full border border-border bg-white/75 px-4 text-base text-ink outline-none transition focus:border-green focus:ring-2"
                minLength={8}
                name="password"
                placeholder="At least 8 characters"
                required
                type="password"
              />
              {mode === "signup" ? (
                <span className="mt-2 block text-xs font-semibold text-ink-soft">
                  Use at least 8 characters.
                </span>
              ) : null}
            </label>

            <SubmitButton
              label={mode === "signin" ? "Log in" : "Sign up"}
              pendingLabel={mode === "signin" ? "Logging in..." : "Signing up..."}
              pendingOverride={passwordStatus === "submitting"}
            />

            <div className="flex flex-col gap-2 text-sm font-semibold sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setShowMagicLink(true)}
                className="inline-flex items-center gap-2 text-green transition hover:text-amber-deep"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                Email me a sign-in link instead
              </button>
              <a
                href={`/auth/forgot?next=${encodeURIComponent(nextPath)}`}
                className="text-muted transition hover:text-amber-deep"
              >
                Forgot password?
              </a>
            </div>

            {passwordMessage ? (
              <p className="text-sm font-semibold text-red">
                {passwordMessage}
              </p>
            ) : null}
          </form>
        ) : (
          <form action={magicAction} className="space-y-4">
            <input name="nextPath" type="hidden" value={nextPath} />
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-amber-deep">
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              Password-free option
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-ink">Email</span>
              <input
                autoComplete="email"
                className="focus:ring-green/15 mt-2 min-h-12 w-full rounded-full border border-border bg-white/75 px-4 text-base text-ink outline-none transition focus:border-green focus:ring-2"
                inputMode="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </label>

            <SubmitButton label="Send me a link" pendingLabel="Sending..." />

            <button
              type="button"
              onClick={() => setShowMagicLink(false)}
              className="text-sm font-semibold text-green transition hover:text-amber-deep"
            >
              Use email and password instead
            </button>

            {magicState.message ? (
              <p className="text-sm font-semibold text-red">
                {magicState.message}
              </p>
            ) : null}
          </form>
        )}
      </div>
    </div>
  );
}
