import type { TocEntry } from "@/lib/markdown/toc";

/**
 * "On this page". Plain anchors — native fragment scrolling needs no JavaScript.
 * No id on the heading: this renders twice (mobile disclosure and desktop rail),
 * so aria-label avoids duplicate ids in the document.
 */
export function TableOfContents({ entries }: { entries: TocEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
        On this page
      </p>
      <ul className="space-y-px border-l">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={`text-muted-foreground hover:border-foreground hover:text-foreground -ml-px block border-l-2 border-transparent py-1 text-[13px] leading-snug transition-colors ${
                entry.depth === 3 ? "pl-6" : "pl-3"
              }`}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
