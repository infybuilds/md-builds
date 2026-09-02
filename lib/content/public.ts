import { createPublicClient } from "@/lib/supabase/public";
import type { Category, Document, Workshop } from "@/types/database";

/**
 * Every read here goes through the session-free anon client, so RLS guarantees
 * only published content comes back — the `published` filters below are belt and
 * braces, not the security boundary.
 */

export type LessonSummary = Pick<
  Document,
  "id" | "title" | "slug" | "description" | "sort_order" | "locked"
>;

export type DocumentSummary = LessonSummary & {
  updated_at: string;
  categories: Pick<Category, "name" | "slug"> | null;
  workshops: Pick<Workshop, "title" | "slug"> | null;
};

/**
 * `content` is null when the lesson is locked. The body is never fetched in that
 * case, so it cannot leak through the page or the RSC payload.
 */
export type PublishedDocument = Omit<Document, "content"> & {
  content: string | null;
  categories: Pick<Category, "name" | "slug"> | null;
  workshops: Pick<Workshop, "id" | "title" | "slug"> | null;
};

const SUMMARY_COLUMNS =
  "id, title, slug, description, sort_order, locked, updated_at, categories(name, slug), workshops(title, slug)";

// Every column except `content`: that one is no longer selectable and comes from
// the document_content function, which enforces publication and lock state.
const DOCUMENT_COLUMNS =
  "id, title, slug, description, category_id, workshop_id, published, locked, sort_order, created_at, updated_at, categories(name, slug), workshops(id, title, slug)";

/**
 * supabase-js resolves rather than throws on failure, so a database or network
 * problem would otherwise show up as a silently empty page. Callers still degrade
 * gracefully — a reader gets an empty list, not a crash — but the cause is logged.
 */
function logQueryError(context: string, error: { message: string } | null) {
  if (error) console.error(`[content] ${context}: ${error.message}`);
}

export async function getPublishedDocument(
  slug: string,
): Promise<PublishedDocument | null> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("documents")
    .select(DOCUMENT_COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  logQueryError(`document ${slug}`, error);
  if (!data) return null;

  // Locked: do not even ask for the body, so it cannot reach the browser.
  if (data.locked) return { ...data, content: null };

  const { data: content, error: contentError } = await supabase.rpc(
    "document_content",
    { p_slug: slug },
  );
  logQueryError(`document content ${slug}`, contentError);

  return { ...data, content: content ?? null };
}

/** Ordered lesson list for a workshop, used by the sidebar and prev/next nav. */
export async function getWorkshopLessons(
  workshopId: string,
): Promise<LessonSummary[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("documents")
    .select("id, title, slug, description, sort_order, locked")
    .eq("workshop_id", workshopId)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  logQueryError(`lessons for workshop ${workshopId}`, error);
  return data ?? [];
}

export type Adjacent = {
  previous: LessonSummary | null;
  next: LessonSummary | null;
};

/** Previous/next by `sort_order` within the same workshop. */
export function findAdjacentLessons(
  lessons: LessonSummary[],
  currentId: string,
): Adjacent {
  const index = lessons.findIndex((lesson) => lesson.id === currentId);

  if (index === -1) return { previous: null, next: null };

  return {
    previous: lessons[index - 1] ?? null,
    next: lessons[index + 1] ?? null,
  };
}

export async function getPublishedWorkshops(): Promise<Workshop[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("workshops")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  logQueryError("published workshops", error);
  return data ?? [];
}

export async function getPublishedWorkshop(
  slug: string,
): Promise<Workshop | null> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("workshops")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  logQueryError(`workshop ${slug}`, error);
  return data ?? null;
}

/**
 * Categories the public can see. RLS already hides categories with no published
 * documents, so this needs no extra filtering.
 */
export async function getPublicCategories(): Promise<Category[]> {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  logQueryError("public categories", error);
  return data ?? [];
}

export async function getPublishedDocuments(
  limit?: number,
): Promise<DocumentSummary[]> {
  const supabase = createPublicClient();

  let query = supabase
    .from("documents")
    .select(SUMMARY_COLUMNS)
    .eq("published", true)
    .order("updated_at", { ascending: false });

  if (limit !== undefined) query = query.limit(limit);

  const { data, error } = await query;

  logQueryError("published documents", error);
  return data ?? [];
}
