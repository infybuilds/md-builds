import type { NextRequest } from "next/server";

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
 * `requireAdmin()` in app/admin/layout.tsx and in every server action, backed by
 * RLS in Postgres. Proxy must never be the only thing standing between an
 * anonymous request and admin data.
 */
export async function proxy(request: NextRequest) {
  const { supabase, response, redirect } = createProxyClient(request);

  // Must run before the response is generated so a token refresh can be written.
  const { data } = await supabase.auth.getClaims();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isLoginRoute = pathname === "/admin/login";

  if (isAdminRoute && !isLoginRoute && !data?.claims) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return redirect(loginUrl);
  }

  return response();
}

export const config = {
  matcher: [
    // Everything except Next.js internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
