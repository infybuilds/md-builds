import { Plus } from "lucide-react";
import Link from "next/link";

import {
  deleteDocument,
  setDocumentPublished,
} from "@/app/admin/_actions/documents";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listDocuments } from "@/lib/content/admin";
import { formatDate } from "@/lib/format";

export default async function AdminDocumentsPage() {
  const documents = await listDocuments();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {documents.length} total. Drafts are invisible to the public.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/documents/new">
            <Plus className="size-4" />
            New document
          </Link>
        </Button>
      </div>

      {documents.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No documents yet.{" "}
          <Link href="/admin/documents/new" className="underline">
            Create the first one
          </Link>
          .
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table className="min-w-[52rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Workshop</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <Link
                      href={`/admin/documents/${document.id}/edit`}
                      className="font-medium hover:underline"
                    >
                      {document.title}
                    </Link>
                    <span className="text-muted-foreground mt-0.5 block font-mono text-xs">
                      /docs/{document.slug}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {document.categories?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {document.workshops?.title ?? "—"}
                    {document.workshops ? (
                      <span className="block text-xs">
                        #{document.sort_order}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={document.published ? "default" : "secondary"}
                      className="font-normal"
                    >
                      {document.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {formatDate(document.updated_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-0.5">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/documents/${document.id}/edit`}>
                          Edit
                        </Link>
                      </Button>
                      {document.published ? (
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/docs/${document.slug}`}>View</Link>
                        </Button>
                      ) : null}
                      <PublishToggle
                        action={setDocumentPublished}
                        id={document.id}
                        published={document.published}
                      />
                      <ConfirmDelete
                        action={deleteDocument}
                        id={document.id}
                        name={document.title}
                        description="The document and its public URL are removed permanently."
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
