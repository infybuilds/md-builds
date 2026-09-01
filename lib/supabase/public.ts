import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Session-free client for public pages.
 *
 * Two reasons this exists instead of reusing the cookie-bound server client:
 *
 *  1. **Security by construction.** With no session attached, RLS resolves these
 *     requests as `anon`, so the query *cannot* see unpublished content even if
 *     a page forgot to filter on `published`.
 *  2. **Cacheability.** Touching `cookies()` opts a route out of static
 *     rendering. Public doc pages stay prerendered and are refreshed by
 *     `revalidatePath` when an admin publishes something.
 *
 * Stateless, so a single instance is shared across requests.
 */
let client: ReturnType<typeof createSupabaseClient<Database>> | undefined;

export function createPublicClient() {
  client ??= createSupabaseClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return client;
}
