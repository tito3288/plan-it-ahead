"use client";

import { CheckCircle2, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type ResetPasswordFormProps = {
  code: string | null;
  nextPath: string;
};

type ResetStatus = "checking" | "ready" | "saving" | "saved" | "error";

function passwordError(password: string, confirmPassword: string) {
  if (password.length < 8) {
    return "Use at least 8 characters for your new password.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return null;
}

export function ResetPasswordForm({
  code,
  nextPath
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<ResetStatus>("checking");
  const [message, setMessage] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function prepareRecoverySession() {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!active) {
          return;
        }

        if (error) {
          setMessage("This reset link is invalid or has expired.");
          setStatus("error");
          return;
        }

        setStatus("ready");
        return;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (session) {
        setStatus("ready");
      } else {
        setMessage("Open the reset link from your email to choose a password.");
        setStatus("error");
      }
    }

    void prepareRecoverySession();

    return () => {
      active = false;
    };
  }, [code]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationMessage = passwordError(password, confirmPassword);

    if (validationMessage) {
      setMessage(validationMessage);
      setStatus("ready");
      return;
    }

    setStatus("saving");
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      setMessage("We could not update your password. Try the reset link again.");
      setStatus("error");
      return;
    }

    setStatus("saved");
    setMessage("Password updated.");
    router.replace(nextPath);
    router.refresh();
  }

  if (status === "checking") {
    return (
      <div className="rounded-[18px] border border-border bg-white/70 p-5 text-center shadow-soft backdrop-blur-sm sm:p-6">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-soft text-green">
          <KeyRound className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-heading text-3xl font-semibold text-ink">
          Checking reset link
        </h2>
        <p className="mt-3 text-base leading-7 text-ink-soft">
          This should only take a moment.
        </p>
      </div>
    );
  }

  if (status === "saved") {
    return (
      <div className="rounded-[18px] border border-border bg-white/70 p-5 text-center shadow-soft backdrop-blur-sm sm:p-6">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-soft text-green">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-heading text-3xl font-semibold text-ink">
          Password updated
        </h2>
        <p className="mt-3 text-base leading-7 text-ink-soft">
          Taking you back to your plans.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[18px] border border-border bg-white/70 p-5 shadow-soft backdrop-blur-sm sm:p-6"
    >
      <label className="block">
        <span className="text-sm font-semibold text-ink">New password</span>
        <input
          autoComplete="new-password"
          className="focus:ring-green/15 mt-2 min-h-12 w-full rounded-full border border-border bg-white/75 px-4 text-base text-ink outline-none transition focus:border-green focus:ring-2"
          minLength={8}
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 8 characters"
          required
          type="password"
          value={password}
        />
      </label>

      <label className="mt-4 block">
        <span className="text-sm font-semibold text-ink">Confirm password</span>
        <input
          autoComplete="new-password"
          className="focus:ring-green/15 mt-2 min-h-12 w-full rounded-full border border-border bg-white/75 px-4 text-base text-ink outline-none transition focus:border-green focus:ring-2"
          minLength={8}
          name="confirmPassword"
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Re-enter your password"
          required
          type="password"
          value={confirmPassword}
        />
      </label>

      <Button
        className="mt-5 w-full"
        disabled={status === "saving" || status === "error"}
        type="submit"
      >
        {status === "saving" ? "Updating..." : "Update password"}
      </Button>

      {message ? (
        <p className="mt-4 text-sm font-semibold text-red">{message}</p>
      ) : null}

      {status === "error" ? (
        <Button className="mt-5 w-full" href="/auth/forgot" variant="secondary">
          Request a new link
        </Button>
      ) : null}
    </form>
  );
}
