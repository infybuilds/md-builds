"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  checkbox,
  isUniqueViolation,
  parse,
  slugTakenState,
  text,
  type FormState,
} from "@/lib/actions/form-state";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { documentSchema, idSchema } from "@/lib/validation/schemas";

/**
 * Public pages are cached, so every mutation has to invalidate them. Documents
 * surface on the homepage, the category lists, their own page and their
 * workshop's lesson list, so the whole public tree is refreshed rather than
 * trying to enumerate affected paths (and needing extra lookups to do it).
 */
function revalidatePublicPages(): void {
  revalidatePath("/", "layout");
}

function readDocumentForm(formData: FormData) {
  return parse(documentSchema, {
    title: text(formData, "title"),
    slug: text(formData, "slug"),
    description: text(formData, "description"),
    content: text(formData, "content"),
    category_id: text(formData, "category_id"),
    workshop_id: text(formData, "workshop_id"),
    published: checkbox(formData, "published"),
    sort_order: text(formData, "sort_order"),
  });
}

export async function createDocument(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  // Authorization first, before touching anything the client sent.
  await requireAdmin();

  const parsed = readDocumentForm(formData);
  if (!parsed.success) return parsed.state;

  const supabase = await createClient();
  const { error } = await supabase.from("documents").insert(parsed.data);

  if (error) {
    if (isUniqueViolation(error)) return slugTakenState();
    return { message: "Could not create the document. Please try again." };
  }

  revalidatePublicPages();
  redirect("/admin/documents");
}

export async function updateDocument(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const id = idSchema.safeParse(text(formData, "id"));
  if (!id.success) return { message: "Unknown document." };

  const parsed = readDocumentForm(formData);
  if (!parsed.success) return parsed.state;

  const supabase = await createClient();
  const { error } = await supabase
    .from("documents")
    .update(parsed.data)
    .eq("id", id.data);

  if (error) {
    if (isUniqueViolation(error)) return slugTakenState();
    return { message: "Could not save the document. Please try again." };
  }

  revalidatePublicPages();
  revalidatePath(`/admin/documents/${id.data}/edit`);
  redirect("/admin/documents");
}

export async function setDocumentPublished(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = idSchema.parse(text(formData, "id"));
  const published = text(formData, "published") === "true";

  const supabase = await createClient();
  const { error } = await supabase
    .from("documents")
    .update({ published })
    .eq("id", id);

  if (error) throw new Error("Could not change the publish state.");

  revalidatePublicPages();
  revalidatePath("/admin/documents");
}

export async function deleteDocument(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = idSchema.parse(text(formData, "id"));
  // The UI reveals a second, explicit confirm button which supplies this.
  if (text(formData, "confirm") !== "delete") {
    throw new Error("Delete was not confirmed.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("documents").delete().eq("id", id);

  if (error) throw new Error("Could not delete the document.");

  revalidatePublicPages();
  redirect("/admin/documents");
}
