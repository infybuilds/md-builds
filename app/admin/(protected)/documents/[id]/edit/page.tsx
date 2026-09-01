import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteDocument, updateDocument } from "@/app/admin/_actions/documents";
import { DocumentForm } from "@/components/admin/document-form";
import { Badge } from "@/components/ui/badge";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { getDocument, getDocumentFormOptions } from "@/lib/content/admin";

export default async function EditDocumentPage({
  params,
}: PageProps<"/admin/documents/[id]/edit">) {
  const { id } = await params;

  const [document, options] = await Promise.all([
    getDocument(id),
    getDocumentFormOptions(),
  ]);

  if (!document) notFound();

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
          {document.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Badge
            variant={document.published ? "default" : "secondary"}
            className="font-normal"
          >
            {document.published ? "Published" : "Draft"}
          </Badge>
          {document.published ? (
            <Link
              href={`/docs/${document.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm hover:underline"
            >
              View live page
              <ExternalLink className="size-3.5" />
            </Link>
          ) : (
            <span className="text-muted-foreground text-sm">
              Drafts have no public page — use the preview below.
            </span>
          )}
        </div>
      </div>

      <DocumentForm
        action={updateDocument}
        categories={options.categories}
        workshops={options.workshops}
        document={document}
        submitLabel="Save changes"
      />

      <section className="border-t pt-6">
        <h2 className="text-sm font-medium">Danger zone</h2>
        <p className="text-muted-foreground mt-1 mb-3 text-sm">
          Deleting a document removes it and its public URL permanently.
        </p>
        <ConfirmDelete
          action={deleteDocument}
          id={document.id}
          name={document.title}
          description="The document and its public URL are removed permanently."
        />
      </section>
    </div>
  );
}
