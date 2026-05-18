"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <PageShell maxWidth="md">
      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl font-bold text-ink">Welcome back</h1>
        <p className="mt-2 font-mono text-sm text-ink-muted">
          Log in to continue learning or teaching.
        </p>
      </div>

      {message === "confirm-email" && (
        <p className="mb-6 rounded-xl border-2 border-ink bg-lemon/50 px-4 py-3 font-mono text-sm text-ink">
          Check your email for a confirmation link, then log in.
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border-2 border-ink bg-card p-8 shadow-cartoon"
      >
        <div className="space-y-5">
          <label className="block">
            <span className="font-mono text-sm font-semibold text-ink">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border-2 border-ink bg-offwhite px-4 py-3 font-mono text-sm outline-none ring-coral focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="font-mono text-sm font-semibold text-ink">
              Password
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border-2 border-ink bg-offwhite px-4 py-3 font-mono text-sm outline-none ring-coral focus:ring-2"
            />
          </label>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border-2 border-coral bg-peach/40 px-4 py-3 font-mono text-sm">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Logging in…" : "Log in"}
          </Button>
          <p className="text-center font-mono text-xs text-ink-muted">
            New here?{" "}
            <Link
              href="/onboarding"
              className="font-semibold text-coral underline"
            >
              Get started
            </Link>
          </p>
        </div>
      </form>
    </PageShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <PageShell maxWidth="md">
          <p className="text-center font-mono text-ink-muted">Loading…</p>
        </PageShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
