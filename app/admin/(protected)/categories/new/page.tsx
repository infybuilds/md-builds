import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { createCategory } from "@/app/admin/_actions/categories";
import { CategoryForm } from "@/components/admin/category-form";

export default function NewCategoryPage() {
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
          New category
        </h1>
      </div>

      <CategoryForm action={createCategory} submitLabel="Create category" />
    </div>
  );
}
