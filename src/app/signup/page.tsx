"use client";

import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import {
  clearPendingRole,
  getPendingRole,
  roleToProfileMeta,
  type AccountRole,
} from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const roleLabels: Record<AccountRole, string> = {
  student: "Student account",
  instructor: "Instructor + student account",
};

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<AccountRole | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const pending = getPendingRole();
    if (!pending) {
      router.replace("/onboarding");
      return;
    }
    setRole(pending);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;

    setError(null);
    setLoading(true);

    const supabase = createClient();
    const meta = roleToProfileMeta(role);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          can_act_as_instructor: meta.can_act_as_instructor,
          active_mode: meta.active_mode,
          onboarding_completed: meta.onboarding_completed,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        display_name: displayName,
        can_act_as_instructor: meta.can_act_as_instructor,
        active_mode: meta.active_mode,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.warn("Profile upsert:", profileError.message);
      }
    }

    clearPendingRole();
    setLoading(false);

    if (data.session) {
      router.push("/dashboard");
    } else {
      router.push("/login?message=confirm-email");
    }
  }

  if (!role) {
    return (
      <PageShell maxWidth="md">
        <p className="text-center font-mono text-ink-muted">Loading…</p>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth="md">
      <div className="mb-8 text-center">
        <p className="font-mono text-sm font-semibold uppercase tracking-wider text-ink-muted">
          Step 2 of 2
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-ink">
          Create your account
        </h1>
        <p className="mt-2 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-sand px-4 py-1 font-mono text-xs font-semibold">
          {roleLabels[role]}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border-2 border-ink bg-card p-8 shadow-cartoon"
      >
        <div className="space-y-5">
          <label className="block">
            <span className="font-mono text-sm font-semibold text-ink">
              Display name
            </span>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Alex"
              className="mt-1.5 w-full rounded-xl border-2 border-ink bg-offwhite px-4 py-3 font-mono text-sm outline-none ring-coral focus:ring-2"
            />
          </label>

          <label className="block">
            <span className="font-mono text-sm font-semibold text-ink">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
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
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="mt-1.5 w-full rounded-xl border-2 border-ink bg-offwhite px-4 py-3 font-mono text-sm outline-none ring-coral focus:ring-2"
            />
          </label>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border-2 border-coral bg-peach/40 px-4 py-3 font-mono text-sm text-ink">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account…" : "Sign up"}
          </Button>
          <p className="text-center font-mono text-xs text-ink-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-coral underline">
              Log in
            </Link>
          </p>
          <Button
            type="button"
            variant="ghost"
            className="w-full text-sm"
            onClick={() => router.push("/onboarding")}
          >
            Change role
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
