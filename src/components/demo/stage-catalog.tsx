import { ExampleNotice } from "@/components/catalog/example-notice";
import { GradeCard } from "@/components/catalog/grade-card";
import { RatingMeter } from "@/components/catalog/rating-meter";
import { Frame, RealBadge, Reveal, type StageProps } from "./stage-parts";

export const SAMPLE_SIZE_LABEL = "12.7 x 101.6 mm";
const fmtRange = (min: number, max: number) => (min === max ? `${min}` : `${min} - ${max}`);

export function CatalogStage({ step, data }: StageProps) {
  const { d2 } = data;
  const showSheet = step >= 2;
  const solera = d2.sizes.filter((s) => s.shape === "Solera");
  const target = solera.findIndex((s) => s.label === SAMPLE_SIZE_LABEL);
  const start = Math.max(0, Math.min(target < 0 ? 0 : target - 2, solera.length - 6));
  const rows = solera.slice(start, start + 6);

  return (
    <Frame
      path={showSheet ? `pibasa / catalogo / ${d2.slug}` : "pibasa / catalogo"}
      badge={<RealBadge>{data.source === "catalog" ? "Catálogo real" : "Muestra local"}</RealBadge>}
    >
      <div className="relative min-h-[300px]">
        {/* Vista de listado */}
        <div className={`transition-opacity duration-500 ${showSheet ? "pointer-events-none absolute inset-0 opacity-0" : "opacity-100"}`}>
          <div data-focus="search" className="field flex items-center justify-between !py-2.5">
            <span className={step >= 1 ? "font-mono text-steel-100" : "text-steel-500"}>
              {step >= 1 ? "D2" : "Buscar por grado, equivalencia o aplicación"}
              {step >= 1 && <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-signal" />}
            </span>
            <span className="font-mono text-xs text-steel-500">
              {data.totalGrades} {data.totalGrades === 1 ? "grado" : "grados"}
            </span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.cards.map((g, i) => {
              const dim = step >= 1 && g.slug !== "d2";
              return (
                <div
                  key={g.slug}
                  data-focus={g.slug === "d2" ? "grade-d2" : undefined}
                  className={`origin-center rounded-2xl transition-[opacity,transform] duration-700 ease-spring ${
                    dim ? "scale-[0.97] opacity-20" : "opacity-100"
                  } ${step >= 1 && !dim ? "scale-[1.01]" : ""}`}
                >
                  <ul className="pointer-events-none h-full [&>li]:h-full">
                    <GradeCard grade={g} index={i} />
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ficha de D2 */}
        <div className={`transition-opacity duration-500 ${showSheet ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0"}`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <h3 className="font-mono text-4xl font-medium tracking-tight">{d2.code}</h3>
              <p className="text-sm text-steel-300">{d2.name}</p>
              <p className="eyebrow !text-steel-500">{d2.family}</p>
            </div>
            {d2.isExample && <span className="chip chip-warn">Datos de ejemplo</span>}
          </div>

          <div className="mt-4 grid items-start gap-4 lg:grid-cols-3">
            <div data-focus="sheet-props" className="rounded-xl border border-ink-600/60 bg-ink-950/40 p-4">
              <p className="eyebrow">Propiedades</p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-steel-300">Densidad</dt>
                  <dd className="font-mono">{d2.densityGcm3} g/cm3</dd>
                </div>
                {d2.hardnessWorkingHrc && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-steel-300">Dureza de trabajo</dt>
                    <dd className="font-mono">{fmtRange(d2.hardnessWorkingHrc.min, d2.hardnessWorkingHrc.max)} HRC</dd>
                  </div>
                )}
              </dl>
              <div className="mt-4 space-y-3">
                <RatingMeter label="Desgaste" value={d2.ratings.wearResistance} />
                <RatingMeter label="Tenacidad" value={d2.ratings.toughness} />
              </div>
            </div>

            <div className="rounded-xl border border-ink-600/60 bg-ink-950/40 p-4">
              <p className="eyebrow">Equivalencias</p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {d2.equivalences.map((e) => (
                  <li key={e.designation} className="flex justify-between gap-3">
                    <span className="text-steel-300">{e.standard}</span>
                    <span className="font-mono">{e.designation}</span>
                  </li>
                ))}
              </ul>
              <p className="eyebrow mt-4">Aplicaciones</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {d2.applications.map((a) => (
                  <li key={a} className="chip !normal-case !tracking-normal">
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            <Reveal on={step >= 3}>
              <div data-focus="sheet-sizes" className="rounded-xl border border-ink-600/60 bg-ink-950/40">
                <p className="eyebrow border-b border-ink-600/60 px-4 py-3">Medidas · Solera</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-steel-500">
                      <th scope="col" className="px-4 py-2 font-normal">Medida</th>
                      <th scope="col" className="px-4 py-2 text-right font-normal">kg/m</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const hit = r.label === SAMPLE_SIZE_LABEL;
                      return (
                        <tr
                          key={r.label}
                          className={`border-t border-ink-600/40 ${hit ? "bg-signal/[0.12] text-steel-100" : "text-steel-300"}`}
                        >
                          <td className="px-4 py-2 font-mono">{r.label}</td>
                          <td className="px-4 py-2 text-right font-mono tabular-nums">{r.weightPerMeterKg.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <ExampleNotice compact />
      </div>
    </Frame>
  );
}
