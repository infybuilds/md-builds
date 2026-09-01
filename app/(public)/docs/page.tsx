import type { Metadata } from "next";
import Link from "next/link";

import {
  getPublicCategories,
  getPublishedDocuments,
} from "@/lib/content/public";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Developer guides, tutorials and cheat sheets published by InfyBuilds.",
  alternates: { canonical: "/docs" },
};

const UNCATEGORISED = "other-guides";

/**
 * Rendered on demand rather than prerendered at build time. The build would
 * otherwise need database credentials just to produce these pages, which couples
 * every build to environment configuration; the queries here are small and the
 * pages are served from the edge either way. Publishing also shows up
 * immediately, with no revalidation step.
 */
export const dynamic = "force-dynamic";

export default async function DocsIndexPage() {
  const [categories, documents] = await Promise.all([
    getPublicCategories(),
    getPublishedDocuments(),
  ]);

  // Grouped in memory: the published set is small, so this stays at two queries
  // instead of one per category.
  const groups = categories.map((category) => ({
    id: category.slug,
    name: category.name,
    description: category.description,
    documents: documents.filter(
      (document) => document.categories?.slug === category.slug,
    ),
  }));

  const uncategorised = documents.filter((document) => !document.categories);

  if (uncategorised.length > 0) {
    groups.push({
      id: UNCATEGORISED,
      name: "Other guides",
      description: null,
      documents: uncategorised,
    });
  }

  const populated = groups.filter((group) => group.documents.length > 0);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Guides</h1>
      <p className="text-muted-foreground mt-2">
        Tutorials, references and cheat sheets, grouped by topic.
      </p>

      {populated.length === 0 ? (
        <p className="text-muted-foreground mt-10 text-sm">
          Nothing published yet.
        </p>
      ) : (
        <div className="mt-12 space-y-12">
          {populated.map((group) => (
            <section key={group.id} id={group.id} className="scroll-mt-20">
              <h2 className="font-medium">{group.name}</h2>
              {group.description ? (
                <p className="text-muted-foreground mt-1 text-sm">
                  {group.description}
                </p>
              ) : null}
              <ul className="mt-4 divide-y border-y">
                {group.documents.map((document) => (
                  <li key={document.id}>
                    <Link
                      href={`/docs/${document.slug}`}
                      className="hover:bg-muted/50 -mx-2 block rounded px-2 py-3 transition-colors"
                    >
                      <span className="text-sm font-medium">
                        {document.title}
                      </span>
                      {document.description ? (
                        <span className="text-muted-foreground mt-0.5 block text-sm">
                          {document.description}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
