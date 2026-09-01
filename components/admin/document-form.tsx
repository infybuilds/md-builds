"use client";

import { Eye, PencilLine } from "lucide-react";
import { useActionState, useState } from "react";

import { MarkdownPreview } from "@/components/markdown/markdown-preview";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError, FormMessage } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { initialFormState, type FormState } from "@/lib/actions/form-state";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";
import type { Category, Document, Workshop } from "@/types/database";

/** Radix Select rejects empty-string values, so "none" is the null sentinel. */
const NONE = "none";

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  categories: Category[];
  workshops: Workshop[];
  /** Absent when creating. */
  document?: Document;
  submitLabel: string;
};

export function DocumentForm({
  action,
  categories,
  workshops,
  document,
  submitLabel,
}: Props) {
  const [state, formAction] = useActionState(action, initialFormState);

  const [title, setTitle] = useState(document?.title ?? "");
  const [slug, setSlug] = useState(document?.slug ?? "");
  // Once the admin touches the slug, stop deriving it from the title. Editing an
  // existing document never re-derives: its slug is already a public URL.
  const [slugLocked, setSlugLocked] = useState(Boolean(document));
  const [content, setContent] = useState(document?.content ?? "");
  // Narrow screens show one pane at a time; lg shows both.
  const [pane, setPane] = useState<"write" | "preview">("write");

  return (
    <form action={formAction} className="space-y-8">
      {document ? <input type="hidden" name="id" value={document.id} /> : null}

      <FormMessage message={state.message} />

      <div className="grid gap-5 sm:grid-cols-2">
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
            Public URL: <code>/docs/{slug || "…"}</code>
          </p>
          <FieldError messages={state.fieldErrors?.slug} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          defaultValue={document?.description ?? ""}
          maxLength={500}
        />
        <p className="text-muted-foreground text-xs">
          Shown in listings and used as the page meta description.
        </p>
        <FieldError messages={state.fieldErrors?.description} />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="category_id">Category</Label>
          <Select
            name="category_id"
            defaultValue={document?.category_id ?? NONE}
          >
            <SelectTrigger id="category_id" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>None</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError messages={state.fieldErrors?.category_id} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workshop_id">Workshop</Label>
          <Select
            name="workshop_id"
            defaultValue={document?.workshop_id ?? NONE}
          >
            <SelectTrigger id="workshop_id" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>None</SelectItem>
              {workshops.map((workshop) => (
                <SelectItem key={workshop.id} value={workshop.id}>
                  {workshop.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError messages={state.fieldErrors?.workshop_id} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sort_order">Sort order</Label>
          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            min={0}
            step={1}
            defaultValue={document?.sort_order ?? 0}
          />
          <p className="text-muted-foreground text-xs">
            Lesson order within the workshop.
          </p>
          <FieldError messages={state.fieldErrors?.sort_order} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Label htmlFor="content">Markdown content</Label>

          {/* Pane switch, only needed where the two panes cannot sit together. */}
          <div className="bg-muted flex rounded-md p-0.5 lg:hidden">
            {(
              [
                { value: "write", label: "Write", icon: PencilLine },
                { value: "preview", label: "Preview", icon: Eye },
              ] as const
            ).map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={pane === option.value ? "outline" : "ghost"}
                className="h-7 px-2.5 text-xs"
                aria-pressed={pane === option.value}
                onClick={() => setPane(option.value)}
              >
                <option.icon className="size-3.5" />
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Always mounted, so its value submits even when the preview shows. */}
          <Textarea
            id="content"
            name="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={26}
            spellCheck={false}
            className={cn(
              "min-h-[28rem] resize-y font-mono text-[13px] leading-relaxed",
              pane === "preview" && "hidden lg:block",
            )}
          />
          <div
            className={cn(
              "bg-muted/30 min-h-[28rem] overflow-auto rounded-md border p-5",
              pane === "write" && "hidden lg:block",
            )}
          >
            <MarkdownPreview content={content} />
          </div>
        </div>
        <p className="text-muted-foreground text-xs">
          GitHub Flavored Markdown. Code fences get syntax highlighting on the
          published page.
        </p>
        <FieldError messages={state.fieldErrors?.content} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-6">
        <div className="flex items-center gap-2.5">
          <Checkbox
            id="published"
            name="published"
            defaultChecked={document?.published ?? false}
          />
          <Label htmlFor="published" className="font-normal">
            Published
          </Label>
        </div>

        <SubmitButton pendingLabel="Saving…">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
