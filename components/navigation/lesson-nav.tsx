import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import type { Adjacent } from "@/lib/content/public";

/** Previous/next lesson within a workshop, ordered by `sort_order`. */
export function LessonNav({ previous, next }: Adjacent) {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Lesson navigation"
      className="mt-16 grid gap-3 border-t pt-8 sm:grid-cols-2"
    >
      {previous ? (
        <Link
          href={`/docs/${previous.slug}`}
          className="hover:border-foreground/30 group rounded-lg border p-4 transition-colors"
        >
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <ArrowLeft className="size-3.5" />
            Previous
          </span>
          <span className="mt-1.5 block text-sm font-medium">
            {previous.title}
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}

      {next ? (
        <Link
          href={`/docs/${next.slug}`}
          className="hover:border-foreground/30 group rounded-lg border p-4 text-right transition-colors sm:col-start-2"
        >
          <span className="text-muted-foreground flex items-center justify-end gap-1.5 text-xs">
            Next
            <ArrowRight className="size-3.5" />
          </span>
          <span className="mt-1.5 block text-sm font-medium">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
