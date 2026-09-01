import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  deleteCategory,
  updateCategory,
} from "@/app/admin/_actions/categories";
import { CategoryForm } from "@/components/admin/category-form";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { getCategory } from "@/lib/content/admin";

export default async function EditCategoryPage({
  params,
}: PageProps<"/admin/categories/[id]/edit">) {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/categories"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="size-3.5" />
          Categories
        </Link>
        <h1 className="mt-3 text-xl font-semibold tracking-tight">
          {category.name}
        </h1>
      </div>

      <CategoryForm
        action={updateCategory}
        category={category}
        submitLabel="Save changes"
      />

      <section className="border-t pt-6">
        <h2 className="text-sm font-medium">Danger zone</h2>
        <p className="text-muted-foreground mt-1 mb-3 text-sm">
          Documents in this category are kept — they become uncategorised.
        </p>
        <ConfirmDelete
          action={deleteCategory}
          id={category.id}
          name={category.name}
          description="Documents in this category are kept — they become uncategorised."
        />
      </section>
    </div>
  );
}
