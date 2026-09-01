"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  isUniqueViolation,
  parse,
  slugTakenState,
  text,
  type FormState,
} from "@/lib/actions/form-state";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { categorySchema, idSchema } from "@/lib/validation/schemas";

function readCategoryForm(formData: FormData) {
  return parse(categorySchema, {
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    description: text(formData, "description"),
  });
}

export async function createCategory(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const parsed = readCategoryForm(formData);
  if (!parsed.success) return parsed.state;

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert(parsed.data);

  if (error) {
    if (isUniqueViolation(error)) return slugTakenState();
    return { message: "Could not create the category. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/admin/categories");
}

export async function updateCategory(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const id = idSchema.safeParse(text(formData, "id"));
  if (!id.success) return { message: "Unknown category." };

  const parsed = readCategoryForm(formData);
  if (!parsed.success) return parsed.state;

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update(parsed.data)
    .eq("id", id.data);

  if (error) {
    if (isUniqueViolation(error)) return slugTakenState();
    return { message: "Could not save the category. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = idSchema.parse(text(formData, "id"));
  if (text(formData, "confirm") !== "delete") {
    throw new Error("Delete was not confirmed.");
  }

  const supabase = await createClient();
  // Documents survive: the FK is ON DELETE SET NULL, so they become uncategorised.
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) throw new Error("Could not delete the category.");

  revalidatePath("/", "layout");
  redirect("/admin/categories");
}
