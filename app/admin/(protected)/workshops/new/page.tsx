import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { createWorkshop } from "@/app/admin/_actions/workshops";
import { WorkshopForm } from "@/components/admin/workshop-form";

export default function NewWorkshopPage() {
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
          New workshop
        </h1>
      </div>

      <WorkshopForm action={createWorkshop} submitLabel="Create workshop" />
    </div>
  );
}
