import Link from "next/link";

import { LoginForm } from "@/app/login/LoginForm";
import { safeRedirectPath } from "@/lib/auth/session";
import { getSiteUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: {
    error?: string;
    next?: string;
  };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const nextPath = safeRedirectPath(searchParams.next);
  const siteUrl = getSiteUrl();

  return (
    <main className="min-h-screen px-5 py-6 sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <Link
          href="/"
          className="font-heading text-3xl font-semibold leading-none text-green"
        >
          PlanItAhead
        </Link>
        <Link
          href="/plan"
          className="text-sm font-semibold text-green transition hover:text-amber-deep"
        >
          Plan a trip
        </Link>
      </div>

      <section className="mx-auto mt-16 grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-deep">
            Sign in
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight text-ink sm:text-6xl">
            Save plans without another password.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-soft">
            Enter your email and we will send a secure magic link. Your saved
            trips stay private to your account.
          </p>
        </div>

        <LoginForm
          errorMessage={searchParams.error ?? null}
          nextPath={nextPath}
          siteUrl={siteUrl}
        />
      </section>
    </main>
  );
}
