/**
 * Supabase env helpers.
 * Prefer publishable/secret keys (sb_publishable_ / sb_secret_).
 *
 * IMPORTANT: Use static process.env.NEXT_PUBLIC_* access only.
 * Dynamic lookups (process.env[name]) are NOT inlined for the browser bundle.
 */

function trim(value: string | undefined): string | undefined {
  const v = value?.trim();
  return v && v.length > 0 ? v : undefined;
}

export function getSupabaseUrl(): string {
  // Static access required for client-side inlining
  const url = trim(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Add it to .env.local from Supabase → Project Settings → API, then restart `npm run dev`."
    );
  }
  return url;
}

export function getSupabasePublishableKey(): string {
  const key =
    trim(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ??
    trim(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Add your publishable key (sb_publishable_...) to .env.local, then restart `npm run dev`."
    );
  }
  return key;
}

/** Server-only. Optional until admin/background jobs need it. */
export function getSupabaseSecretKey(): string | undefined {
  return (
    trim(process.env.SUPABASE_SECRET_KEY) ??
    trim(process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}
