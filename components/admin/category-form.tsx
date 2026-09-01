"use client";

import { useActionState, useState } from "react";

import { FieldError, FormMessage } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialFormState, type FormState } from "@/lib/actions/form-state";
import { slugify } from "@/lib/slug";
import type { Category } from "@/types/database";

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  category?: Category;
  submitLabel: string;
};

export function CategoryForm({ action, category, submitLabel }: Props) {
  const [state, formAction] = useActionState(action, initialFormState);

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugLocked, setSlugLocked] = useState(Boolean(category));

  return (
    <form action={formAction} className="max-w-lg space-y-6">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}

      <FormMessage message={state.message} />

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (!slugLocked) setSlug(slugify(event.target.value));
          }}
          required
          maxLength={120}
        />
        <FieldError messages={state.fieldErrors?.name} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlugLocked(true);
            setSlug(event.target.value);
          }}
          required
          maxLength={120}
          className="font-mono text-[13px]"
        />
        <FieldError messages={state.fieldErrors?.slug} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          defaultValue={category?.description ?? ""}
          maxLength={500}
        />
        <p className="text-muted-foreground text-xs">
          Optional. Shown above the category listing.
        </p>
        <FieldError messages={state.fieldErrors?.description} />
      </div>

      <SubmitButton pendingLabel="Saving…">{submitLabel}</SubmitButton>
    </form>
  );
}
