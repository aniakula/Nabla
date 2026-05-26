import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/supabase/env";

/**
 * Server-only. Returns a Supabase client authenticated as the service role,
 * bypassing RLS. Use only inside API route handlers after verifying the user JWT.
 */
export function createServiceClient() {
  const secretKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ??
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!secretKey) {
    throw new Error(
      "Missing SUPABASE_SECRET_KEY. Add your service/secret key to .env.local."
    );
  }

  return createSupabaseClient(getSupabaseUrl(), secretKey, {
    auth: { persistSession: false },
  });
}
