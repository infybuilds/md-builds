"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change theme">
          {/* Both icons render; CSS shows the one matching the active theme, so
              there is no flash from waiting on the mounted theme value. */}
          <Sun className="size-4 dark:hidden" />
          <Moon className="hidden size-4 dark:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setTheme(option.value)}
          >
            <option.icon className="size-4" />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
