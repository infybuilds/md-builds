import Link from "next/link";

import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { Button } from "@/components/ui/button";

/**
 * Reached for unknown URLs and for `notFound()` — including a document that
 * exists but is not published, which is deliberately indistinguishable from one
 * that does not exist.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start px-4 py-24">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          404
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          We couldn&apos;t find that page
        </h1>
        <p className="text-muted-foreground mt-2">
          The link may be out of date, or the document may not be published yet.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/">Go to the homepage</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/docs">Browse guides</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
