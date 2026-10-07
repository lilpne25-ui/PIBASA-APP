import type { Metadata } from "next";
import { getPublicCatalog } from "@/infrastructure/container";
import { ExampleNotice } from "@/components/catalog/example-notice";
import { FilterBar } from "@/components/catalog/filter-bar";
import { GradeCard } from "@/components/catalog/grade-card";
import { QuoteCta } from "@/components/catalog/quote-cta";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata(): Promise<Metadata> {
  // No se indexa mientras haya datos de ejemplo; al verificarlos todos, se indexa solo.
  const cards = await getPublicCatalog().list();
  return {
    title: "Catalogo tecnico de aceros | Pibasa",
    description:
      "Aceros grado herramienta, maquinaria y estirados en frio: propiedades, equivalencias, aplicaciones y medidas con peso teorico. Aceros y Servicios Pibasa, Queretaro.",
    robots: { index: cards.length > 0 && !cards.some((c) => c.isExample), follow: true }
  };
}

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const active = { family: first(sp.family), shape: first(sp.shape), q: first(sp.q)?.slice(0, 60) };
  const catalog = getPublicCatalog();
  const [grades, facets] = await Promise.all([
    catalog.list({ familyCode: active.family, shape: active.shape, q: active.q }),
    catalog.facets()
  ]);
  const anyExample = grades.some((g) => g.isExample);

  return (
    <main>
      <section className="rise-in max-w-3xl">
        <p className="eyebrow">Catalogo tecnico</p>
        <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          El acero correcto,
          <span className="block text-steel-500">antes de pedirlo.</span>
        </h1>
        <p className="mt-6 max-w-xl text-steel-300">
          Consulta grados de herramienta y maquinaria, sus equivalencias, aplicaciones y medidas con peso teorico.
          Cuando lo tengas claro, solicita tu cotizacion.
        </p>
        <QuoteCta className="mt-8" />
      </section>

      {anyExample && (
        <div className="rise-in rise-in-2 mt-10">
          <ExampleNotice />
        </div>
      )}

      <div className="rise-in rise-in-2 mt-10">
        <FilterBar facets={facets} active={active} />
      </div>

      <p className="mt-10 font-mono text-xs uppercase tracking-[0.25em] text-steel-500" aria-live="polite">
        {grades.length} {grades.length === 1 ? "grado" : "grados"}
      </p>

      {grades.length === 0 ? (
        <div className="panel mt-4 p-10 text-center text-steel-300">
          No encontramos grados con esos filtros. Prueba con otro codigo o limpia los filtros.
        </div>
      ) : (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {grades.map((g, i) => (
            <GradeCard key={g.slug} grade={g} index={i} />
          ))}
        </ul>
      )}
    </main>
  );
}
