import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client untuk operasi privileged (cron job, admin task)
 * yang harus melewati RLS. JANGAN dipakai di kode yang dipanggil user biasa.
 *
 * Service role key disimpan di env var SUPABASE_SERVICE_ROLE_KEY (server-only).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing Supabase admin env vars (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)"
    );
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
