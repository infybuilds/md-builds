import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Per-request Supabase client for Server Components, Server Actions and Route
 * Handlers. Never cache or share the returned client across requests — it
 * carries the caller's session.
 *
 * Reads and writes are still subject to RLS: the anon key plus the user's JWT
 * is the only authority this app uses.
 */
export async function createClient() {
  // Async in Next.js 16 — the synchronous form was removed.
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot write cookies. Token refreshes are
          // written back by proxy.ts instead, which runs before rendering.
        }
      },
    },
  });
}
