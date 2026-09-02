import { AdsScript } from "@/components/ads/ads-script";
import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";

/**
 * Chrome for everything a visitor sees. Admin routes live outside this group and
 * have their own shell.
 */
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      {/* Public pages only — never loaded under /admin. */}
      <AdsScript />
    </>
  );
}
