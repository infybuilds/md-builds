import { z } from "zod";

/**
 * Shape returned by every admin server action to `useActionState`.
 * `fieldErrors` keys match the form input `name` attributes.
 */
export type FormState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialFormState: FormState = {};

/** `formData.get` returns `File | string | null`; forms here only send text. */
export function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Unchecked checkboxes are absent from FormData entirely. */
export function checkbox(formData: FormData, name: string): boolean {
  return formData.get(name) === "on";
}

export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; state: FormState };

export function parse<T extends z.ZodType>(
  schema: T,
  input: unknown,
): ParseResult<z.output<T>> {
  const result = schema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    state: {
      message: "Please fix the highlighted fields.",
      fieldErrors: z.flattenError(result.error).fieldErrors,
    },
  };
}

/**
 * Postgres unique-violation. Checking for an existing slug before inserting
 * would race, so the constraint is the arbiter and this maps it to a field
 * error the admin can act on.
 */
export function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}

export function slugTakenState(): FormState {
  return {
    message: "Please fix the highlighted fields.",
    fieldErrors: { slug: ["That slug is already in use."] },
  };
}
