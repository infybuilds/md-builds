import { ArrowRight, BookOpen, FileText } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getPublishedDocuments,
  getPublishedWorkshops,
} from "@/lib/content/public";

const LATEST_LIMIT = 8;

/**
 * Rendered on demand rather than prerendered at build time. The build would
 * otherwise need database credentials just to produce these pages, which couples
 * every build to environment configuration; the queries here are small and the
 * pages are served from the edge either way. Publishing also shows up
 * immediately, with no revalidation step.
 */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [workshops, documents] = await Promise.all([
    getPublishedWorkshops(),
    getPublishedDocuments(LATEST_LIMIT),
  ]);

  const featured = workshops[0];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:py-24">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          InfyBuilds Docs
        </h1>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed">
          Developer guides, workshop materials and practical references. No
          account needed — everything published here is free to read.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/workshops">
              <BookOpen className="size-4" />
              Browse workshops
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/docs">
              <FileText className="size-4" />
              Browse guides
            </Link>
          </Button>
        </div>
      </section>

      {featured ? (
        <section className="mt-16">
          <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
            Featured workshop
          </p>
          <Link
            href={`/workshops/${featured.slug}`}
            className="hover:border-foreground/30 block rounded-lg border p-5 transition-colors"
          >
            <h2 className="font-medium">{featured.title}</h2>
            {featured.description ? (
              <p className="text-muted-foreground mt-1.5 text-sm">
                {featured.description}
              </p>
            ) : null}
            <span className="mt-4 flex items-center gap-1.5 text-sm font-medium">
              View workshop
              <ArrowRight className="size-3.5" />
            </span>
          </Link>
        </section>
      ) : null}

      <section className="mt-16">
        <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
          Latest guides
        </p>
        {documents.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nothing published yet. Check back soon.
          </p>
        ) : (
          <ul className="divide-y border-y">
            {documents.map((document) => (
              <li key={document.id}>
                <Link
                  href={`/docs/${document.slug}`}
                  className="hover:bg-muted/50 -mx-2 flex items-center justify-between gap-4 rounded px-2 py-3 transition-colors"
                >
                  <span className="text-sm font-medium">{document.title}</span>
                  {document.categories || document.workshops ? (
                    <Badge variant="secondary" className="shrink-0 font-normal">
                      {document.categories?.name ?? document.workshops?.title}
                    </Badge>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
