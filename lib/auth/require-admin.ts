import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export type AdminContext = {
  user: User;
  profile: Profile;
};

type AuthResult =
  | { status: "anonymous" }
  | { status: "not-admin"; user: User }
  | ({ status: "admin" } & AdminContext);

/**
 * Resolves the caller's verified identity and role.
 *
 * Uses `getUser()` rather than `getSession()`: the session is read from cookies,
 * which the client controls, so it must not be trusted for authorization.
 * `getUser()` validates the token against the Auth server.
 */
async function resolveAuth(): Promise<AuthResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return { status: "anonymous" };

  // The role lives in the database, not in the JWT, so revoking admin takes
  // effect on the very next request.
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") return { status: "not-admin", user };

  return { status: "admin", user, profile };
}

/** Non-redirecting variant, for pages that merely branch on admin-ness. */
export async function getAdminContext(): Promise<AdminContext | null> {
  const result = await resolveAuth();
  return result.status === "admin"
    ? { user: result.user, profile: result.profile }
    : null;
}

/**
 * Gate for every admin page and every admin mutation. Call this first, before
 * reading form data or touching the database.
 *
 * Unauthenticated visitors go to the login page; authenticated non-admins are
 * sent to the public site rather than being told an admin area exists.
 */
export async function requireAdmin(): Promise<AdminContext> {
  const result = await resolveAuth();

  if (result.status === "anonymous") redirect("/admin/login");
  if (result.status === "not-admin") redirect("/");

  return { user: result.user, profile: result.profile };
}
