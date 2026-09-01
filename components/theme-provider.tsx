"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Class-based dark mode, which is what shadcn's `dark:` variant keys off.
 * Client-side because it reads and writes localStorage.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
