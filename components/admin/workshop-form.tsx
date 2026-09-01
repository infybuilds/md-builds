"use client";

import { useActionState, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { FieldError, FormMessage } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { initialFormState, type FormState } from "@/lib/actions/form-state";
import { slugify } from "@/lib/slug";
import type { Workshop } from "@/types/database";

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  workshop?: Workshop;
  submitLabel: string;
};

export function WorkshopForm({ action, workshop, submitLabel }: Props) {
  const [state, formAction] = useActionState(action, initialFormState);

  const [title, setTitle] = useState(workshop?.title ?? "");
  const [slug, setSlug] = useState(workshop?.slug ?? "");
  const [slugLocked, setSlugLocked] = useState(Boolean(workshop));

  return (
    <form action={formAction} className="max-w-lg space-y-6">
      {workshop ? <input type="hidden" name="id" value={workshop.id} /> : null}

      <FormMessage message={state.message} />

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (!slugLocked) setSlug(slugify(event.target.value));
          }}
          required
          maxLength={200}
        />
        <FieldError messages={state.fieldErrors?.title} />
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
        <p className="text-muted-foreground text-xs">
          Public URL: <code>/workshops/{slug || "…"}</code>
        </p>
        <FieldError messages={state.fieldErrors?.slug} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={workshop?.description ?? ""}
          maxLength={500}
          rows={3}
        />
        <p className="text-muted-foreground text-xs">
          Shown on the workshop card and the workshop page.
        </p>
        <FieldError messages={state.fieldErrors?.description} />
      </div>

      <div className="flex items-center gap-2.5">
        <Checkbox
          id="published"
          name="published"
          defaultChecked={workshop?.published ?? false}
        />
        <Label htmlFor="published" className="font-normal">
          Published
        </Label>
      </div>

      <SubmitButton pendingLabel="Saving…">{submitLabel}</SubmitButton>
    </form>
  );
}
