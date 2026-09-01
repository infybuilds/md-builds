import { FileCode2 } from "lucide-react";
import Link from "next/link";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/workshops", label: "Workshops" },
  { href: "/docs", label: "Guides" },
] as const;

/**
 * Public navigation. Deliberately no link to /admin — admins navigate there
 * directly. That is tidiness, not security: the route is protected server-side.
 */
export function SiteHeader() {
  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
        <Link
          href="/"
          className="mr-auto flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <FileCode2 className="size-4" />
          InfyBuilds
          <span className="text-muted-foreground font-normal">Docs</span>
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map((link) => (
            <Button key={link.href} asChild variant="ghost" size="sm">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        <ModeToggle />
      </div>
    </header>
  );
}
