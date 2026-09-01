/**
 * Fixed locale and timezone-free formatting: these strings are produced on the
 * server, so anything locale-dependent would risk a hydration mismatch.
 */
const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  dateStyle: "medium",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}
