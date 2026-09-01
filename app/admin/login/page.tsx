import type { Metadata } from "next";
import { FileCode2 } from "lucide-react";
import { redirect } from "next/navigation";

import { signIn } from "@/app/admin/_actions/auth";
import { LoginForm } from "@/components/admin/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAdminContext } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  title: "Admin sign in",
  // Admin pages must never be indexed. robots.txt is a second, weaker signal.
  robots: { index: false, follow: false },
};

/**
 * Sits outside app/admin/(protected)/, so it is the one /admin route without the
 * `requireAdmin()` gate.
 */
export default async function LoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const admin = await getAdminContext();
  if (admin) redirect("/admin");

  const { next } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2 text-sm font-semibold tracking-tight">
          <FileCode2 className="size-4" />
          InfyBuilds
          <span className="text-muted-foreground font-normal">Docs</span>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Admin sign in</CardTitle>
            <CardDescription>
              Only administrators can sign in here. Readers never need an
              account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm
              action={signIn}
              next={typeof next === "string" ? next : "/admin"}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
