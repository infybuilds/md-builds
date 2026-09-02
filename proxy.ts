import { NextResponse, type NextRequest } from "next/server";

import { createProxyClient } from "@/lib/supabase/proxy";

/**
 * Next.js 16 renamed Middleware to Proxy. Runs on the Node.js runtime; the edge
 * runtime is not supported here.
 *
 * Two jobs:
 *  1. Refresh the Supabase session cookie on every matched request.
 *  2. Bounce obviously-unauthenticated visitors away from /admin.
 *
 * (2) is an *optimistic* check only. The real authorization gate is
 * `requireAdmin()` in app/admin/(protected)/layout.tsx and in every server
 * action, backed by RLS in Postgres. Proxy must never be the only thing standing
 * between an anonymous request and admin data.
 */
export async function proxy(request: NextRequest) {
  let client: ReturnType<typeof createProxyClient>;

  try {
    client = createProxyClient(request);
  } catch (error) {
    // Misconfiguration must not take down every route. Proxy only refreshes
    // sessions, so pass the request through and let the page report the problem
    // — /admin/login and error pages then still render, and /api/health can say
    // what is missing. This grants nothing: requireAdmin() still gates /admin,
    // and it fails closed because it needs the same configuration.
    console.error(
      "[proxy] Supabase is not configured, skipping session refresh:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.next({ request });
  }

  const { supabase, response, redirect } = client;

  // Must run before the response is generated so a token refresh can be written.
  let hasSession = false;
  try {
    const { data } = await supabase.auth.getClaims();
    hasSession = Boolean(data?.claims);
  } catch (error) {
    // Auth service unreachable. Treat as signed out, which fails closed: the
    // visitor is sent to the login page rather than past it.
    console.error(
      "[proxy] Could not read the session:",
      error instanceof Error ? error.message : error,
    );
  }

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isLoginRoute = pathname === "/admin/login";

  if (isAdminRoute && !isLoginRoute && !hasSession) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return redirect(loginUrl);
  }

  return response();
}

export const config = {
  matcher: [
    // Everything except Next.js internals, static assets, and the health check
    // (which must stay answerable even when configuration is broken).
    "/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
