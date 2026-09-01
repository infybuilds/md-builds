import { Skeleton } from "@/components/ui/skeleton";

/** Admin routes are always dynamic, so this shell is genuinely seen. */
export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <Skeleton className="h-7 w-40" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-64" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
