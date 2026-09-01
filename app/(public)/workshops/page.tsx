import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { getPublishedWorkshops } from "@/lib/content/public";

export const metadata: Metadata = {
  title: "Workshops",
  description:
    "Hands-on workshop materials from InfyBuilds, organised lesson by lesson.",
  alternates: { canonical: "/workshops" },
};

export default async function WorkshopsPage() {
  const workshops = await getPublishedWorkshops();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Workshops</h1>
      <p className="text-muted-foreground mt-2">
        Follow along lesson by lesson. Nothing here needs an account.
      </p>

      {workshops.length === 0 ? (
        <p className="text-muted-foreground mt-10 text-sm">
          No workshops published yet.
        </p>
      ) : (
        <ul className="mt-10 space-y-3">
          {workshops.map((workshop) => (
            <li key={workshop.id}>
              <Link
                href={`/workshops/${workshop.slug}`}
                className="hover:border-foreground/30 block rounded-lg border p-5 transition-colors"
              >
                <h2 className="font-medium">{workshop.title}</h2>
                {workshop.description ? (
                  <p className="text-muted-foreground mt-1.5 text-sm">
                    {workshop.description}
                  </p>
                ) : null}
                <span className="mt-4 flex items-center gap-1.5 text-sm font-medium">
                  View workshop
                  <ArrowRight className="size-3.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
