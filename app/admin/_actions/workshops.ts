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
import { idSchema, workshopSchema } from "@/lib/validation/schemas";

function readWorkshopForm(formData: FormData) {
  return parse(workshopSchema, {
    title: text(formData, "title"),
    slug: text(formData, "slug"),
    description: text(formData, "description"),
    published: checkbox(formData, "published"),
  });
}

export async function createWorkshop(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const parsed = readWorkshopForm(formData);
  if (!parsed.success) return parsed.state;

  const supabase = await createClient();
  const { error } = await supabase.from("workshops").insert(parsed.data);

  if (error) {
    if (isUniqueViolation(error)) return slugTakenState();
    return { message: "Could not create the workshop. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/admin/workshops");
}

export async function updateWorkshop(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const id = idSchema.safeParse(text(formData, "id"));
  if (!id.success) return { message: "Unknown workshop." };

  const parsed = readWorkshopForm(formData);
  if (!parsed.success) return parsed.state;

  const supabase = await createClient();
  const { error } = await supabase
    .from("workshops")
    .update(parsed.data)
    .eq("id", id.data);

  if (error) {
    if (isUniqueViolation(error)) return slugTakenState();
    return { message: "Could not save the workshop. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect("/admin/workshops");
}

export async function setWorkshopPublished(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = idSchema.parse(text(formData, "id"));
  const published = text(formData, "published") === "true";

  const supabase = await createClient();
  const { error } = await supabase
    .from("workshops")
    .update({ published })
    .eq("id", id);

  if (error) throw new Error("Could not change the publish state.");

  revalidatePath("/", "layout");
  revalidatePath("/admin/workshops");
}

export async function deleteWorkshop(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = idSchema.parse(text(formData, "id"));
  if (text(formData, "confirm") !== "delete") {
    throw new Error("Delete was not confirmed.");
  }

  const supabase = await createClient();
  // Lessons survive: the FK is ON DELETE SET NULL, so they become standalone docs.
  const { error } = await supabase.from("workshops").delete().eq("id", id);

  if (error) throw new Error("Could not delete the workshop.");

  revalidatePath("/", "layout");
  redirect("/admin/workshops");
}
