import Link from "next/link";

const LINKS = [
  { href: "/viewer", label: "Markdown viewer" },
  { href: "/docs", label: "Guides" },
  { href: "/workshops", label: "Workshops" },
] as const;

/**
 * The links here are site-wide, which is the point: every page reaches every
 * section in one hop, so a crawler that lands on a deep lesson can still find
 * the rest of the site.
 */
export function SiteFooter() {
  return (
    <footer className="mt-20 border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-8 text-xs">
        <span>
          InfyBuilds — Markdown viewer, developer guides and workshops.
        </span>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 sm:ml-auto">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
