"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Slide-out navigation for narrow screens. `children` is the server-rendered
 * sidebar, passed straight through.
 */
export function MobileDocNav({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <Menu className="size-4" />
          {label}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[19rem] p-0">
        <SheetHeader className="border-b">
          <SheetTitle className="text-sm">{label}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="p-4">{children}</div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
