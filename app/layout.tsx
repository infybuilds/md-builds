import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { siteUrl } from "@/lib/supabase/env";

import "./globals.css";

// Variable names match the shadcn theme tokens in globals.css.
const fontSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Makes the canonical and Open Graph URLs on child pages absolute.
  metadataBase: new URL(siteUrl()),
  title: {
    default: "InfyBuilds Docs",
    template: "%s | InfyBuilds",
  },
  description:
    "Developer guides, workshop materials and practical references from InfyBuilds.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: next-themes sets the class on <html> before
    // hydration, which would otherwise be reported as a mismatch.
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={`${fontSans.variable} ${fontMono.variable} flex min-h-full flex-col antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
