import { Lock } from "lucide-react";
import Link from "next/link";

import type { LessonSummary } from "@/lib/content/public";
import type { Category, Workshop } from "@/types/database";

type Props = {
  categories: Category[];
  workshop: Pick<Workshop, "title" | "slug"> | null;
  lessons: LessonSummary[];
  currentSlug: string;
};

/** Sidebar contents, shared by the desktop rail and the mobile sheet. */
export function DocSidebarContent({
  categories,
  workshop,
  lessons,
  currentSlug,
}: Props) {
  return (
    <div className="space-y-8 text-sm">
      {workshop && lessons.length > 0 ? (
        <section>
          <Link
            href={`/workshops/${workshop.slug}`}
            className="text-muted-foreground hover:text-foreground mb-3 block text-xs font-medium tracking-wide uppercase"
          >
            {workshop.title}
          </Link>
          <ol className="space-y-px">
            {lessons.map((lesson, index) => {
              const isCurrent = lesson.slug === currentSlug;
              return (
                <li key={lesson.id}>
                  <Link
                    href={`/docs/${lesson.slug}`}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`flex gap-2.5 rounded-md px-2 py-1.5 text-[13px] leading-snug transition-colors ${
                      isCurrent
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <span className="text-muted-foreground tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1">{lesson.title}</span>
                    {lesson.locked ? (
                      <Lock
                        className="text-muted-foreground mt-0.5 size-3 shrink-0"
                        aria-label="Locked"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      {categories.length > 0 ? (
        <section>
          <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
            Categories
          </p>
          <ul className="space-y-px">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/docs#${category.slug}`}
                  className="text-muted-foreground hover:bg-muted/60 hover:text-foreground block rounded-md px-2 py-1.5 text-[13px] transition-colors"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
