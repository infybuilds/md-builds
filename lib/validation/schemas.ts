import { z } from "zod";

import { SLUG_MESSAGE, SLUG_PATTERN } from "@/lib/slug";

/**
 * Field names match both the form inputs and the database columns, so parsed
 * output can be handed straight to Supabase without remapping.
 */

const slugField = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .max(120, "Keep the slug under 120 characters.")
  .regex(SLUG_PATTERN, SLUG_MESSAGE);

const nullIfEmpty = (value: string) => (value.length > 0 ? value : null);

const descriptionField = z
  .string()
  .trim()
  .max(500, "Keep the description under 500 characters.")
  .transform(nullIfEmpty);

/**
 * "No category" / "no workshop" is stored as NULL. Two spellings are accepted:
 * a plain select submits "", while a Radix select needs a non-empty sentinel
 * because it rejects empty-string item values.
 */
const NO_SELECTION = "none";

const optionalIdField = z
  .union([
    z.literal(""),
    z.literal(NO_SELECTION),
    z.uuid("Select a valid option."),
  ])
  .transform((value) =>
    value === "" || value === NO_SELECTION ? null : value,
  );

export const documentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(200, "Keep the title under 200 characters."),
  slug: slugField,
  description: descriptionField,
  content: z.string().max(400_000, "Content is too large."),
  category_id: optionalIdField,
  workshop_id: optionalIdField,
  published: z.boolean(),
  sort_order: z.coerce
    .number({ error: "Sort order must be a whole number." })
    .int("Sort order must be a whole number.")
    .min(0, "Sort order cannot be negative.")
    .max(100_000, "Sort order is too large."),
});

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(120, "Keep the name under 120 characters."),
  slug: slugField,
  description: descriptionField,
});

export const workshopSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(200, "Keep the title under 200 characters."),
  slug: slugField,
  description: descriptionField,
  published: z.boolean(),
});

export const credentialsSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const idSchema = z.uuid();
