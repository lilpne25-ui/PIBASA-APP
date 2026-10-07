import type { MetadataRoute } from "next";
import { getPublicCatalog } from "@/infrastructure/container";

export const dynamic = "force-dynamic";

/** Solo lista grados VERIFICADOS: mientras todo sea de ejemplo, el sitemap queda vacio (y las paginas, noindex). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!base) return [];
  const grades = (await getPublicCatalog().list()).filter((g) => !g.isExample);
  if (grades.length === 0) return [];
  return [{ url: `${base}/catalogo` }, ...grades.map((g) => ({ url: `${base}/catalogo/${g.slug}` }))];
}
