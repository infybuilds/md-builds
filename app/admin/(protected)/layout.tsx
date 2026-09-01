import type { Metadata } from "next";

import { AdminHeader } from "@/components/admin/admin-header";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * The authorization gate for every admin page.
 *
 * proxy.ts already bounces requests with no session, but that is an optimistic
 * check on a cookie. This runs on the server for every render, reads the role
 * from the database, and is backed by RLS on every query underneath.
 */
export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const { profile } = await requireAdmin();

  return (
    <>
      <AdminHeader email={profile.email} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </>
  );
}
