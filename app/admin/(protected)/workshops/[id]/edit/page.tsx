import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteWorkshop, updateWorkshop } from "@/app/admin/_actions/workshops";
import { WorkshopForm } from "@/components/admin/workshop-form";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { getWorkshop } from "@/lib/content/admin";

export default async function EditWorkshopPage({
  params,
}: PageProps<"/admin/workshops/[id]/edit">) {
  const { id } = await params;
  const workshop = await getWorkshop(id);

  if (!workshop) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/workshops"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="size-3.5" />
          Workshops
        </Link>
        <h1 className="mt-3 text-xl font-semibold tracking-tight">
          {workshop.title}
        </h1>
      </div>

      <WorkshopForm
        action={updateWorkshop}
        workshop={workshop}
        submitLabel="Save changes"
      />

      <section className="border-t pt-6">
        <h2 className="text-sm font-medium">Danger zone</h2>
        <p className="text-muted-foreground mt-1 mb-3 text-sm">
          Lessons are kept — they become standalone documents.
        </p>
        <ConfirmDelete
          action={deleteWorkshop}
          id={workshop.id}
          name={workshop.title}
          description="Its lessons are kept — they become standalone documents."
        />
      </section>
    </div>
  );
}
