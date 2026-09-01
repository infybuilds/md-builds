import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Builds a Supabase client bound to the proxy request/response pair so refreshed
 * session cookies are written back to the browser. Server Components cannot set
 * cookies, so this is the only place refreshes get persisted.
 *
 * Returns the client plus a mutable response holder; `response()` must be called
 * *after* the auth call so it reflects any cookies that were set.
 */
export function createProxyClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    supabaseUrl(),
    supabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          // Rebuild so downstream handlers see the refreshed request cookies.
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          // Includes the no-store family: a response carrying Set-Cookie for an
          // auth token must never be cached by a CDN and served to someone else.
          for (const [key, value] of Object.entries(headers)) {
            response.headers.set(key, value);
          }
        },
      },
    },
  );

  return {
    supabase,
    response: () => response,
    /**
     * Redirects must carry the cookies and headers accumulated above, otherwise
     * a refresh that happened during this request is lost.
     */
    redirect: (url: URL) => {
      const redirectResponse = NextResponse.redirect(url);
      for (const cookie of response.cookies.getAll()) {
        redirectResponse.cookies.set(cookie);
      }
      const cacheControl = response.headers.get("cache-control");
      if (cacheControl) {
        redirectResponse.headers.set("cache-control", cacheControl);
      }
      return redirectResponse;
    },
  };
}
