import { Plus } from "lucide-react";
import Link from "next/link";

import {
  deleteWorkshop,
  setWorkshopPublished,
} from "@/app/admin/_actions/workshops";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/ui/confirm-delete";
import { listWorkshops } from "@/lib/content/admin";

export default async function AdminWorkshopsPage() {
  const workshops = await listWorkshops();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Workshops</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Lessons are ordered by each document&apos;s sort order.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/workshops/new">
            <Plus className="size-4" />
            New workshop
          </Link>
        </Button>
      </div>

      {workshops.length === 0 ? (
        <p className="text-muted-foreground text-sm">No workshops yet.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {workshops.map((workshop) => (
            <li
              key={workshop.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <Link
                  href={`/admin/workshops/${workshop.id}/edit`}
                  className="font-medium hover:underline"
                >
                  {workshop.title}
                </Link>
                <span className="text-muted-foreground mt-0.5 block font-mono text-xs">
                  /workshops/{workshop.slug}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-0.5">
                <Badge
                  variant={workshop.published ? "default" : "secondary"}
                  className="mr-2 font-normal"
                >
                  {workshop.published ? "Published" : "Draft"}
                </Badge>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/workshops/${workshop.id}/edit`}>
                    Edit
                  </Link>
                </Button>
                {workshop.published ? (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/workshops/${workshop.slug}`}>View</Link>
                  </Button>
                ) : null}
                <PublishToggle
                  action={setWorkshopPublished}
                  id={workshop.id}
                  published={workshop.published}
                />
                <ConfirmDelete
                  action={deleteWorkshop}
                  id={workshop.id}
                  name={workshop.title}
                  description="Its lessons are kept — they become standalone documents."
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
