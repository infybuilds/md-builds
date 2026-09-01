import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { createDocument } from "@/app/admin/_actions/documents";
import { DocumentForm } from "@/components/admin/document-form";
import { getDocumentFormOptions } from "@/lib/content/admin";

export default async function NewDocumentPage() {
  const { categories, workshops } = await getDocumentFormOptions();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/documents"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="size-3.5" />
          Documents
        </Link>
        <h1 className="mt-3 text-xl font-semibold tracking-tight">
          New document
        </h1>
      </div>

      <DocumentForm
        action={createDocument}
        categories={categories}
        workshops={workshops}
        submitLabel="Create document"
      />
    </div>
  );
}
