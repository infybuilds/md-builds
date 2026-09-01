import { FileText, FolderTree, Plus, Presentation } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardCounts } from "@/lib/content/admin";

const SECTIONS = [
  {
    href: "/admin/documents",
    label: "Documents",
    hint: "Write and publish Markdown",
    icon: FileText,
  },
  {
    href: "/admin/workshops",
    label: "Workshops",
    hint: "Group lessons into a course",
    icon: Presentation,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    hint: "Organise standalone guides",
    icon: FolderTree,
  },
] as const;

export default async function AdminDashboardPage() {
  const counts = await getDashboardCounts();

  const stats = [
    { label: "Documents", value: counts.documents },
    { label: "Published", value: counts.publishedDocuments },
    { label: "Drafts", value: counts.draftDocuments },
    { label: "Workshops", value: counts.workshops },
    { label: "Categories", value: counts.categories },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <Button asChild>
          <Link href="/admin/documents/new">
            <Plus className="size-4" />
            New document
          </Link>
        </Button>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label} className="gap-0 py-4">
            <CardHeader className="px-4">
              <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {stat.label}
              </dt>
            </CardHeader>
            <CardContent className="px-4">
              <dd className="text-2xl font-semibold tabular-nums">
                {stat.value}
              </dd>
            </CardContent>
          </Card>
        ))}
      </dl>

      <section>
        <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
          Manage
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {SECTIONS.map((section) => (
            <Link key={section.href} href={section.href} className="group">
              <Card className="hover:border-foreground/30 h-full transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <section.icon className="text-muted-foreground size-4" />
                    {section.label}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {section.hint}
                  </p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
