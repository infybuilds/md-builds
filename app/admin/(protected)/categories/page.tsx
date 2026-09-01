import { Plus } from "lucide-react";
import Link from "next/link";

import { deleteCategory } from "@/app/admin/_actions/categories";
import { Button } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { listCategories } from "@/lib/content/admin";

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            A category appears publicly once it holds a published document.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="size-4" />
            New category
          </Link>
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="text-muted-foreground text-sm">No categories yet.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <Link
                  href={`/admin/categories/${category.id}/edit`}
                  className="font-medium hover:underline"
                >
                  {category.name}
                </Link>
                <span className="text-muted-foreground mt-0.5 block font-mono text-xs">
                  {category.slug}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/categories/${category.id}/edit`}>
                    Edit
                  </Link>
                </Button>
                <ConfirmDelete
                  action={deleteCategory}
                  id={category.id}
                  name={category.name}
                  description="Documents in this category are kept — they become uncategorised."
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
