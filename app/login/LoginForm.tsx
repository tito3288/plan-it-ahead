"use client";

import { CheckCircle2, KeyRound, Mail } from "lucide-react";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import {
  sendMagicLinkAction,
  signInWithPasswordAction,
  signUpWithPasswordAction,
  type LoginState,
  type PasswordAuthState
} from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LoginFormProps = {
  errorMessage: string | null;
  nextPath: string;
};

type AuthMode = "signin" | "signup";

function passwordInitialState(
  errorMessage: string | null
): PasswordAuthState {
  return {
    message: errorMessage,
    redirectTo: null,
    status: errorMessage ? "error" : "idle",
    submittedEmail: null
  };
}

const magicInitialState: LoginState = {
  message: null,
  redirectTo: null,
  status: "idle",
  submittedEmail: null
};

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? pendingLabel : label}
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
  const [signInState, signInAction] = useFormState(
    signInWithPasswordAction,
    passwordInitialState(errorMessage)
  );
  const [signUpState, signUpAction] = useFormState(
    signUpWithPasswordAction,
    passwordInitialState(null)
  );
  const [magicState, magicAction] = useFormState(
    sendMagicLinkAction,
    magicInitialState
  );
  const passwordState = mode === "signin" ? signInState : signUpState;
  const passwordAction = mode === "signin" ? signInAction : signUpAction;

  if (signUpState.status === "sent") {
    return (
      <div className="rounded-[18px] border border-border bg-white/70 p-5 shadow-soft backdrop-blur-sm sm:p-6">
        <SuccessState
          email={signUpState.submittedEmail}
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
          <form action={passwordAction} className="space-y-4">
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

            {passwordState.message ? (
              <p className="text-sm font-semibold text-red">
                {passwordState.message}
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
