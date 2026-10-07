import { DEMO_FOLIO, ILLUSTRATIVE_PRICES, formatCents, simulateQuote } from "@/domain/demo/quote-sim";
import { Frame, Reveal, SimBadge, type StageProps } from "./stage-parts";

const DIMS = { thicknessMm: 12.7, widthMm: 101.6 };
const PIECES = 4;
const PIECE_MM = 300;

export function sampleQuote(density: number) {
  return simulateQuote({ shape: "FLAT_BAR", dims: DIMS, densityGcm3: density, pieces: PIECES, pieceLengthMm: PIECE_MM, cut: true });
}

function Field({ label, value, on, focus, hint }: { label: string; value: string; on: boolean; focus: string; hint?: string }) {
  return (
    <div data-focus={focus} className="rounded-xl border border-ink-600/60 bg-ink-950/40 px-4 py-2.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-steel-500">{label}</p>
      <p className={`mt-1 min-h-6 font-mono text-base transition-colors duration-500 ${on ? "text-steel-100" : "text-ink-600"}`}>
        {on ? value : "—"}
      </p>
      {hint && (
        <p className={`text-xs transition-opacity duration-500 ${on ? "text-steel-500 opacity-100" : "opacity-0"}`}>{hint}</p>
      )}
    </div>
  );
}

function Line({ label, value, on, strong = false }: { label: string; value: string; on: boolean; strong?: boolean }) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 py-1 text-sm transition-opacity duration-500 ${on ? "opacity-100" : "opacity-0"} ${
        strong ? "border-t border-ink-600/70 pt-3 text-base text-steel-100" : "text-steel-300"
      }`}
    >
      <span>{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  );
}

export function QuoteStage({ step, data }: StageProps) {
  const q = sampleQuote(data.d2.densityGcm3);
  const p = ILLUSTRATIVE_PRICES;
  return (
    <Frame path="pibasa / cotizar · simulación" badge={<SimBadge>Simulación · precios ilustrativos</SimBadge>}>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div data-focus="quote-form" className="grid content-start gap-3 sm:grid-cols-2">
          <Field label="Grado" value={data.d2.name} on={step >= 1} focus="q-grade" hint="del catálogo real" />
          <Field label="Forma y medida" value="Solera 12.7 x 101.6 mm" on={step >= 2} focus="q-size" hint={`1/2" x 4" · ${q.weightPerMeterKg.toFixed(2)} kg/m`} />
          <Field label="Cantidad y largo" value={`${PIECES} piezas de ${PIECE_MM} mm`} on={step >= 3} focus="q-qty" hint="con corte a medida" />
          <Field label="Destino" value="León, Guanajuato" on={step >= 4} focus="q-dest" hint="envío nacional" />
          <div className="sm:col-span-2">
            <Reveal on={step >= 5}>
              <span className="btn btn-primary w-full cursor-default shadow-[0_0_30px_-8px_rgba(111,183,201,0.5)]">
                Enviar solicitud (simulado)
              </span>
            </Reveal>
          </div>
        </div>

        <div data-focus="q-total" className="rounded-xl border border-ink-600/60 bg-ink-950/40 p-4">
          <p className="eyebrow">Resumen estimado</p>
          <div className="mt-3">
            <Line label="Peso por metro (catálogo)" value={`${q.weightPerMeterKg.toFixed(2)} kg/m`} on={step >= 2} />
            <Line label="Largo total" value={`${q.totalLengthM.toFixed(2)} m`} on={step >= 3} />
            <Line label="Peso teórico" value={`${q.totalWeightKg.toFixed(2)} kg`} on={step >= 3} />
            <Line label={`Material · ${formatCents(p.pricePerKgCents)}/kg (ej.)`} value={formatCents(q.materialCents)} on={step >= 5} />
            <Line label={`Corte · ${PIECES} x ${formatCents(p.cutFeeCents)} (ej.)`} value={formatCents(q.cutsCents)} on={step >= 5} />
            <Line label="Flete a León (ej.)" value={formatCents(q.freightCents)} on={step >= 5} />
            <Line label="Subtotal" value={formatCents(q.subtotalCents)} on={step >= 5} />
            <Line label="IVA 16%" value={formatCents(q.ivaCents)} on={step >= 5} />
            <Line label="Total estimado" value={formatCents(q.totalCents)} on={step >= 5} strong />
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-steel-500">
            El peso es teórico (densidad del catálogo x volumen). Precio por kg, corte y flete son cifras ilustrativas: no son tarifas de
            Pibasa. En el proyecto, el precio sale de la lista que Pibasa autorice.
          </p>
        </div>
      </div>
    </Frame>
  );
}

export function FolioStage({ step, data }: StageProps) {
  const q = sampleQuote(data.d2.densityGcm3);
  const stages = ["Recibida", "En cotización", "Enviada"];
  const active = step >= 4 ? 1 : step >= 3 ? 0 : -1;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div data-focus="wa-card">
        <Frame path="mensaje a WhatsApp · simulación" badge={<SimBadge>Envío simulado</SimBadge>}>
          <div className="min-h-[240px] rounded-xl bg-ink-950/60 p-4">
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.25em] text-steel-500">Chat con Pibasa (ejemplo)</p>
            <Reveal on={step >= 1} className="mt-4 ml-auto max-w-[92%]">
              <div data-focus="wa-message" className="rounded-2xl rounded-tr-sm border border-signal/25 bg-signal/[0.09] p-4 text-sm leading-relaxed text-steel-100">
                <p>Hola, quiero cotizar:</p>
                <p className="mt-2 font-mono text-[13px] text-steel-100">
                  Acero D2 · Solera 12.7 x 101.6 mm
                  <br />
                  4 piezas de 300 mm, con corte
                  <br />
                  Peso teórico: {q.totalWeightKg.toFixed(2)} kg
                  <br />
                  Destino: León, Gto.
                </p>
              </div>
            </Reveal>
            <Reveal on={step >= 2} className="mt-3 ml-auto max-w-[92%]">
              <div data-focus="wa-folio" className="inline-flex items-center gap-3 rounded-xl border border-ink-600 bg-ink-900 px-4 py-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-steel-500">Folio</span>
                <span className="font-mono text-base text-steel-100">{DEMO_FOLIO}</span>
              </div>
            </Reveal>
          </div>
        </Frame>
      </div>

      <Reveal on={step >= 3}>
        <div data-focus="consult-card">
          <Frame path="pibasa / consulta · simulación" badge={<SimBadge>Consulta por folio</SimBadge>}>
            <div className="min-h-[240px]">
              <p className="eyebrow">Consulta tu cotización</p>
              <div className="field mt-3 !py-2.5 font-mono">{DEMO_FOLIO}</div>
              <div data-focus="consult-timeline" className="mt-6 rounded-xl border border-ink-600/60 bg-ink-950/40 p-5">
                <p className="text-sm text-steel-300">Solicitud de D2 · Solera 12.7 x 101.6 mm</p>
                <ol className="mt-5 space-y-4">
                  {stages.map((s, i) => (
                    <li key={s} className="flex items-center gap-3 text-sm">
                      <span
                        className={`h-3 w-3 rounded-full border transition-all duration-700 ${
                          i < active
                            ? "border-signal bg-signal/70"
                            : i === active
                              ? "border-signal bg-signal shadow-[0_0_14px_2px_rgba(111,183,201,0.6)]"
                              : "border-ink-600"
                        }`}
                      />
                      <span className={i <= active ? "text-steel-100" : "text-steel-500"}>{s}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-5 text-xs text-steel-500">Sin cuenta ni contraseña: el folio es la llave de consulta.</p>
              </div>
            </div>
          </Frame>
        </div>
      </Reveal>
    </div>
  );
}
