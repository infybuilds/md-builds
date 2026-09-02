import type { Metadata } from "next";
import { Lock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/ads/ad-slot";
import { MarkdownContent } from "@/components/markdown/markdown-content";
import { TableOfContents } from "@/components/markdown/table-of-contents";
import { DocSidebarContent } from "@/components/navigation/doc-sidebar";
import { LessonNav } from "@/components/navigation/lesson-nav";
import { MobileDocNav } from "@/components/navigation/mobile-doc-nav";
import {
  findAdjacentLessons,
  getPublicCategories,
  getPublishedDocument,
  getWorkshopLessons,
} from "@/lib/content/public";
import { buildToc } from "@/lib/markdown/toc";

export async function generateMetadata({
  params,
}: PageProps<"/docs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const document = await getPublishedDocument(slug);

  if (!document) return { title: "Document not found" };

  const description = document.description ?? undefined;

  return {
    title: document.title,
    description,
    alternates: { canonical: `/docs/${document.slug}` },
    openGraph: {
      type: "article",
      title: `${document.title} | InfyBuilds`,
      description,
      url: `/docs/${document.slug}`,
    },
  };
}

export default async function DocumentPage({
  params,
}: PageProps<"/docs/[slug]">) {
  const { slug } = await params;

  // Read through the session-free client: an unpublished document is invisible
  // at the database level, so a draft cannot leak here.
  const document = await getPublishedDocument(slug);

  if (!document) notFound();

  const workshop = document.workshops;

  const [lessons, categories] = await Promise.all([
    workshop ? getWorkshopLessons(workshop.id) : Promise.resolve([]),
    getPublicCategories(),
  ]);

  const adjacent = findAdjacentLessons(lessons, document.id);
  // A locked lesson has no body to build a contents list from.
  const toc = document.content ? buildToc(document.content) : [];

  const sidebar = (
    <DocSidebarContent
      categories={categories}
      workshop={workshop}
      lessons={lessons}
      currentSlug={document.slug}
    />
  );

  return (
    <div className="mx-auto w-full max-w-6xl gap-10 px-4 py-8 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_12rem]">
      <div className="mb-6 lg:hidden">
        <MobileDocNav label={workshop ? "Lessons" : "Categories"}>
          {sidebar}
        </MobileDocNav>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
          {sidebar}
        </div>
      </aside>

      <article className="min-w-0">
        <header className="mb-10 border-b pb-8">
          {workshop ? (
            <Link
              href={`/workshops/${workshop.slug}`}
              className="text-muted-foreground hover:text-foreground text-xs font-medium tracking-wide uppercase"
            >
              {workshop.title}
            </Link>
          ) : document.categories ? (
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {document.categories.name}
            </span>
          ) : null}
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {document.title}
          </h1>
          {document.description ? (
            <p className="text-muted-foreground mt-3 leading-relaxed">
              {document.description}
            </p>
          ) : null}
        </header>

        {toc.length > 0 ? (
          <details className="mb-10 rounded-lg border p-4 xl:hidden">
            <summary className="cursor-pointer text-sm font-medium">
              On this page
            </summary>
            <div className="mt-4">
              <TableOfContents entries={toc} />
            </div>
          </details>
        ) : null}

        {document.content === null ? (
          <div className="bg-muted/40 flex flex-col items-center rounded-lg border border-dashed px-6 py-14 text-center">
            <Lock className="text-muted-foreground size-5" />
            <p className="mt-3 font-medium">This lesson is locked</p>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              Your instructor will unlock it during the workshop. The other
              lessons in this workshop are available now.
            </p>
          </div>
        ) : (
          <MarkdownContent content={document.content} />
        )}

        <AdSlot placement="article-bottom" className="mt-12" />

        <LessonNav previous={adjacent.previous} next={adjacent.next} />
      </article>

      <aside className="hidden xl:block">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] space-y-8 overflow-y-auto">
          <TableOfContents entries={toc} />
          <AdSlot placement="sidebar" />
        </div>
      </aside>
    </div>
  );
}
