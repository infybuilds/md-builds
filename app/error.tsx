"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * Last-resort boundary. Shows a generic message only: `error.message` can carry
 * database detail in development, and stack traces must never reach a visitor.
 * The digest is safe — it only correlates with a server log entry.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start px-4 py-24">
      <h1 className="text-2xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="text-muted-foreground mt-2">
        The page couldn&apos;t be loaded. Trying again often clears it.
      </p>
      {error.digest ? (
        <p className="text-muted-foreground mt-4 font-mono text-xs">
          Reference: {error.digest}
        </p>
      ) : null}
      <Button onClick={reset} className="mt-8">
        Try again
      </Button>
    </main>
  );
}
