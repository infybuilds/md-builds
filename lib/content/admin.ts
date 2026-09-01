import { createClient } from "@/lib/supabase/server";
import type { Category, Document, Workshop } from "@/types/database";

/**
 * Admin reads. These use the cookie-bound client, so RLS resolves them as the
 * signed-in admin and drafts are visible. Pages must still call `requireAdmin()`
 * — RLS decides what a request may read, not whether it should have got here.
 */

export type AdminDocumentRow = Pick<
  Document,
  "id" | "title" | "slug" | "published" | "sort_order" | "updated_at"
> & {
  categories: Pick<Category, "name"> | null;
  workshops: Pick<Workshop, "title"> | null;
};

export async function listDocuments(): Promise<AdminDocumentRow[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("documents")
    .select(
      "id, title, slug, published, sort_order, updated_at, categories(name), workshops(title)",
    )
    .order("updated_at", { ascending: false });

  return data ?? [];
}

export async function getDocument(id: string): Promise<Document | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return data ?? null;
}

export async function listCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  return data ?? [];
}

export async function getCategory(id: string): Promise<Category | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return data ?? null;
}

export async function listWorkshops(): Promise<Workshop[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("workshops")
    .select("*")
    .order("title", { ascending: true });

  return data ?? [];
}

export async function getWorkshop(id: string): Promise<Workshop | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("workshops")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return data ?? null;
}

/** Category and workshop options for the document form's selects. */
export async function getDocumentFormOptions() {
  const [categories, workshops] = await Promise.all([
    listCategories(),
    listWorkshops(),
  ]);

  return { categories, workshops };
}

export type DashboardCounts = {
  documents: number;
  publishedDocuments: number;
  draftDocuments: number;
  workshops: number;
  categories: number;
};

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const supabase = await createClient();

  // `head: true` with an exact count transfers no rows.
  const exact = { count: "exact", head: true } as const;

  const [documents, publishedDocuments, workshops, categories] =
    await Promise.all([
      supabase.from("documents").select("id", exact),
      supabase.from("documents").select("id", exact).eq("published", true),
      supabase.from("workshops").select("id", exact),
      supabase.from("categories").select("id", exact),
    ]);

  const total = documents.count ?? 0;
  const published = publishedDocuments.count ?? 0;

  return {
    documents: total,
    publishedDocuments: published,
    draftDocuments: total - published,
    workshops: workshops.count ?? 0,
    categories: categories.count ?? 0,
  };
}
