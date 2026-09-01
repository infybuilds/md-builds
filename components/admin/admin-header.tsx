import { ExternalLink, FileCode2 } from "lucide-react";
import Link from "next/link";

import { signOut } from "@/app/admin/_actions/auth";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/documents", label: "Documents" },
  { href: "/admin/workshops", label: "Workshops" },
  { href: "/admin/categories", label: "Categories" },
] as const;

export function AdminHeader({ email }: { email: string }) {
  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-3 px-4 py-2.5">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <FileCode2 className="size-4" />
          InfyBuilds
          <span className="text-muted-foreground font-normal">Admin</span>
        </Link>

        <nav className="order-3 flex w-full items-center gap-1 sm:order-2 sm:ml-4 sm:w-auto">
          {LINKS.map((link) => (
            <Button key={link.href} asChild variant="ghost" size="sm">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="order-2 ml-auto flex items-center gap-1 sm:order-3">
          <span className="text-muted-foreground mr-2 hidden text-xs lg:inline">
            {email}
          </span>
          <Button asChild variant="ghost" size="sm">
            <Link href="/" target="_blank" rel="noreferrer">
              View site
              <ExternalLink className="size-3.5" />
            </Link>
          </Button>
          <ModeToggle />
          <form action={signOut}>
            <SubmitButton variant="outline" size="sm" pendingLabel="Signing out…">
              Sign out
            </SubmitButton>
          </form>
        </div>
      </div>
    </header>
  );
}
