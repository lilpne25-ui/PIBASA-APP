import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicCatalog } from "@/infrastructure/container";
import { ExampleNotice } from "@/components/catalog/example-notice";
import { QuoteCta } from "@/components/catalog/quote-cta";
import { RatingMeter } from "@/components/catalog/rating-meter";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const sheet = await getPublicCatalog().sheet(slug);
  if (!sheet) return { title: "Grado no encontrado | Pibasa", robots: { index: false } };
  const equiv = sheet.equivalences.map((e) => e.designation).slice(0, 3).join(", ");
  return {
    title: `Acero ${sheet.code}: propiedades, equivalencias y medidas | Pibasa`,
    description: `${sheet.name}. ${sheet.summary}${equiv ? ` Equivalencias: ${equiv}.` : ""}`.slice(0, 300),
    alternates: { canonical: `/catalogo/${sheet.slug}` },
    robots: { index: !sheet.isExample, follow: true }
  };
}

const fmtRange = (min: number, max: number) => (min === max ? `${min}` : `${min} - ${max}`);

export default async function GradePage({ params }: { params: Params }) {
  const { slug } = await params;
  const g = await getPublicCatalog().sheet(slug);
  if (!g) notFound();

  const maxComp = Math.max(...g.composition.map((c) => c.max), 1);
  const bySize = g.sizes.reduce<Record<string, typeof g.sizes>>((acc, s) => {
    (acc[s.shape] ??= []).push(s);
    return acc;
  }, {});

  return (
    <main>
      <Link href="/catalogo" className="text-sm text-steel-300 transition-colors hover:text-steel-100">
        &larr; Catalogo
      </Link>

      <header className="rise-in mt-8 grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="eyebrow">{g.family}</p>
          <h1 className="mt-4 font-mono text-6xl font-medium tracking-tight md:text-8xl">{g.code}</h1>
          <p className="mt-4 text-lg text-steel-100">{g.name}</p>
          <p className="mt-4 max-w-2xl leading-relaxed text-steel-300">{g.summary}</p>
        </div>
        <QuoteCta gradeCode={g.code} />
      </header>

      {g.isExample && (
        <div className="rise-in rise-in-2 mt-10">
          <ExampleNotice />
        </div>
      )}

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        <section className="panel rise-in rise-in-2 p-6 lg:col-span-1" aria-labelledby="props">
          <h2 id="props" className="eyebrow">
            Propiedades
          </h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-steel-300">Densidad</dt>
              <dd className="font-mono">{g.densityGcm3} g/cm3</dd>
            </div>
            {g.hardnessAnnealedHbMax !== null && (
              <div className="flex justify-between gap-4">
                <dt className="text-steel-300">Dureza recocido (max)</dt>
                <dd className="font-mono">{g.hardnessAnnealedHbMax} HB</dd>
              </div>
            )}
            {g.hardnessWorkingHrc && (
              <div className="flex justify-between gap-4">
                <dt className="text-steel-300">Dureza de trabajo</dt>
                <dd className="font-mono">{fmtRange(g.hardnessWorkingHrc.min, g.hardnessWorkingHrc.max)} HRC</dd>
              </div>
            )}
          </dl>
          <div className="hairline mt-6 space-y-5 pt-6">
            <RatingMeter label="Resistencia al desgaste" value={g.ratings.wearResistance} />
            <RatingMeter label="Tenacidad" value={g.ratings.toughness} />
            <RatingMeter label="Maquinabilidad" value={g.ratings.machinability} />
          </div>
          <p className="mt-5 text-xs text-steel-500">Calificaciones relativas entre grados, no medidas fisicas.</p>
        </section>

        <section className="panel rise-in rise-in-3 p-6 lg:col-span-2" aria-labelledby="comp">
          <h2 id="comp" className="eyebrow">
            Composicion quimica tipica (% en peso)
          </h2>
          <ul className="mt-5 space-y-4">
            {g.composition.map((c) => (
              <li key={c.element} className="grid grid-cols-[3rem_1fr_6.5rem] items-center gap-4 text-sm">
                <span className="font-mono text-steel-100">{c.element}</span>
                <span className="relative h-1.5 rounded-full bg-ink-700" aria-hidden="true">
                  <span
                    className="absolute inset-y-0 rounded-full bg-gradient-to-r from-steel-300/70 to-signal/60 shadow-[0_0_12px_-2px_rgba(111,183,201,0.4)]"
                    style={{ left: `${(c.min / maxComp) * 100}%`, width: `${Math.max(((c.max - c.min) / maxComp) * 100, 2)}%` }}
                  />
                </span>
                <span className="text-right font-mono text-steel-300">{fmtRange(c.min, c.max)}</span>
              </li>
            ))}
          </ul>
          {g.heatTreatmentNotes && (
            <div className="hairline mt-6 pt-5">
              <h3 className="eyebrow !text-steel-500">Tratamiento termico</h3>
              <p className="mt-3 text-sm leading-relaxed text-steel-300">{g.heatTreatmentNotes}</p>
            </div>
          )}
        </section>

        <section className="panel rise-in rise-in-3 p-6" aria-labelledby="equiv">
          <h2 id="equiv" className="eyebrow">
            Equivalencias
          </h2>
          <ul className="mt-5 space-y-3 text-sm">
            {g.equivalences.map((e) => (
              <li key={`${e.standard}-${e.designation}`} className="flex items-baseline justify-between gap-4">
                <span className="text-steel-300">{e.standard}</span>
                <span className="text-right font-mono">
                  {e.designation}
                  {e.notes && <span className="ml-2 text-xs text-steel-500">{e.notes}</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel rise-in rise-in-3 p-6 lg:col-span-2" aria-labelledby="apps">
          <h2 id="apps" className="eyebrow">
            Aplicaciones tipicas
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2">
            {g.applications.map((a) => (
              <li key={a} className="chip !normal-case !tracking-normal !text-sm !text-steel-100">
                {a}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-14" aria-labelledby="sizes">
        <h2 id="sizes" className="text-2xl font-semibold tracking-tight">
          Medidas disponibles
        </h2>
        <p className="mt-2 text-sm text-steel-300">
          Peso teorico por metro lineal con la densidad del grado. El peso real varia con la tolerancia del material.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {Object.entries(bySize).map(([shape, rows]) => (
            <div key={shape} className="panel overflow-hidden">
              <h3 className="border-b border-ink-600/70 px-6 py-4 font-mono text-xs uppercase tracking-[0.25em] text-steel-300">
                {shape} <span className="text-steel-500">· {rows.length}</span>
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-steel-500">
                    <th scope="col" className="px-6 py-3 font-normal">Medida</th>
                    <th scope="col" className="px-2 py-3 font-normal">Condicion</th>
                    <th scope="col" className="px-6 py-3 text-right font-normal">kg/m</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={`${r.label}-${r.condition}`} className="border-t border-ink-600/40 transition-colors hover:bg-signal/[0.04]">
                      <td className="px-6 py-2.5 font-mono">{r.label}</td>
                      <td className="px-2 py-2.5 text-steel-300">{r.condition}</td>
                      <td className="px-6 py-2.5 text-right font-mono tabular-nums">{r.weightPerMeterKg.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      <section className="panel mt-14 flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-semibold">Necesitas {g.code} cortado a medida?</h2>
          <p className="mt-2 text-sm text-steel-300">Dinos medidas y cantidad y te cotizamos, con envio a toda la Republica.</p>
        </div>
        <QuoteCta gradeCode={g.code} />
      </section>
    </main>
  );
}
