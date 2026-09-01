import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getPublishedWorkshop, getWorkshopLessons } from "@/lib/content/public";

export async function generateMetadata({
  params,
}: PageProps<"/workshops/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const workshop = await getPublishedWorkshop(slug);

  if (!workshop) return { title: "Workshop not found" };

  const description = workshop.description ?? undefined;

  return {
    title: workshop.title,
    description,
    alternates: { canonical: `/workshops/${workshop.slug}` },
    openGraph: {
      type: "website",
      title: `${workshop.title} | InfyBuilds`,
      description,
      url: `/workshops/${workshop.slug}`,
    },
  };
}

export default async function WorkshopPage({
  params,
}: PageProps<"/workshops/[slug]">) {
  const { slug } = await params;
  const workshop = await getPublishedWorkshop(slug);

  if (!workshop) notFound();

  const lessons = await getWorkshopLessons(workshop.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        {workshop.title}
      </h1>
      {workshop.description ? (
        <p className="text-muted-foreground mt-3 leading-relaxed">
          {workshop.description}
        </p>
      ) : null}

      {lessons.length > 0 ? (
        <Button asChild className="mt-6">
          <Link href={`/docs/${lessons[0].slug}`}>
            Start the first lesson
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      ) : null}

      <p className="text-muted-foreground mt-14 mb-4 text-xs font-medium tracking-wide uppercase">
        Lessons
      </p>

      {lessons.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Lessons for this workshop are not published yet.
        </p>
      ) : (
        <ol className="divide-y border-y">
          {lessons.map((lesson, index) => (
            <li key={lesson.id}>
              <Link
                href={`/docs/${lesson.slug}`}
                className="hover:bg-muted/50 -mx-2 flex gap-3 rounded px-2 py-3 transition-colors"
              >
                <span className="text-muted-foreground pt-px text-sm tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="block text-sm font-medium">
                    {lesson.title}
                  </span>
                  {lesson.description ? (
                    <span className="text-muted-foreground mt-0.5 block text-sm">
                      {lesson.description}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
