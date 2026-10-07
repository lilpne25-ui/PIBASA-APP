import Link from "next/link";
import type { PublicFacets } from "@/application/catalog/public-catalog";

type Active = { family?: string; shape?: string; q?: string };

function href(active: Active, patch: Partial<Active>) {
  const next = { ...active, ...patch };
  const qs = new URLSearchParams();
  if (next.family) qs.set("family", next.family);
  if (next.shape) qs.set("shape", next.shape);
  if (next.q) qs.set("q", next.q);
  const s = qs.toString();
  return s ? `/catalogo?${s}` : "/catalogo";
}

/** Filtros por enlaces y un formulario GET: funciona sin JavaScript. */
export function FilterBar({ facets, active }: { facets: PublicFacets; active: Active }) {
  const hasFilters = Boolean(active.family || active.shape || active.q);
  return (
    <section aria-label="Filtros del catalogo" className="space-y-5">
      <form action="/catalogo" method="get" className="flex flex-col gap-3 sm:flex-row" role="search">
        {active.family && <input type="hidden" name="family" value={active.family} />}
        {active.shape && <input type="hidden" name="shape" value={active.shape} />}
        <label className="sr-only" htmlFor="q">
          Buscar por grado, nombre o equivalencia
        </label>
        <input
          id="q"
          name="q"
          type="search"
          maxLength={60}
          defaultValue={active.q ?? ""}
          placeholder="Buscar: D2, H13, 1.2344, SKD11..."
          className="field sm:max-w-md"
        />
        <button type="submit" className="btn btn-primary">
          Buscar
        </button>
        {hasFilters && (
          <Link href="/catalogo" className="btn btn-ghost">
            Limpiar
          </Link>
        )}
      </form>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-1">Familia</span>
          {facets.families.map((f) => (
            <Link
              key={f.code}
              href={href(active, { family: active.family === f.code ? undefined : f.code })}
              className={`chip ${active.family === f.code ? "chip-active" : ""}`}
              aria-current={active.family === f.code ? "true" : undefined}
            >
              {f.name}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-1">Forma</span>
          {facets.shapes.map((s) => (
            <Link
              key={s.value}
              href={href(active, { shape: active.shape === s.value ? undefined : s.value })}
              className={`chip ${active.shape === s.value ? "chip-active" : ""}`}
              aria-current={active.shape === s.value ? "true" : undefined}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
