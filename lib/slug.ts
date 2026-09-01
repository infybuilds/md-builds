/** Mirrors the `public.slug` domain constraint in the initial migration. */
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const SLUG_MESSAGE =
  "Use lowercase letters, numbers and single hyphens (e.g. git-status).";

/**
 * Best-effort slug from a title. Admins can always override the result, and the
 * database has the final say on uniqueness.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
    .replace(/-+$/g, "");
}
