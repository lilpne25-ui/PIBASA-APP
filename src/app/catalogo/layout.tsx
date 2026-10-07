import { SiteHeader } from "@/components/catalog/site-header";
import { VluxCredit } from "@/components/vlux-credit";

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-12">{children}</div>
      <footer className="hairline mx-auto max-w-6xl px-6 py-10">
        <VluxCredit />
      </footer>
    </>
  );
}
