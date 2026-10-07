"use client";

import { useId, useMemo, useState } from "react";
import { ROI_EMPTY, ROI_ILLUSTRATIVE_DEFAULTS, calculateRoi, type RoiInputs } from "@/domain/demo/roi";
import { Frame, SimBadge, type StageProps } from "./stage-parts";

const mxn0 = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
const num1 = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 });

const fields: { key: keyof RoiInputs; label: string; suffix: string }[] = [
  { key: "quotesPerMonth", label: "Cotizaciones al mes", suffix: "" },
  { key: "minutesToday", label: "Minutos por cotización hoy", suffix: "min" },
  { key: "minutesWithSystem", label: "Minutos con el sistema", suffix: "min" },
  { key: "hourlyCostMxn", label: "Costo por hora del vendedor", suffix: "MXN" },
  { key: "lostQuotesPerMonth", label: "Cotizaciones perdidas por falta de respuesta o seguimiento", suffix: "al mes" },
  { key: "recoveryRatePct", label: "De esas, ¿qué porcentaje se recuperaría?", suffix: "%" },
  { key: "marginPerWonQuoteMxn", label: "Margen por cotización ganada", suffix: "MXN" },
  { key: "investmentMxn", label: "Inversión a comparar (opcional)", suffix: "MXN" }
];

export function RoiStage({ onInteract }: StageProps) {
  const [values, setValues] = useState<Record<keyof RoiInputs, string>>(() => toStrings(ROI_ILLUSTRATIVE_DEFAULTS));
  const baseId = useId();
  const result = useMemo(() => calculateRoi(toNumbers(values)), [values]);
  const illustrative = JSON.stringify(values) === JSON.stringify(toStrings(ROI_ILLUSTRATIVE_DEFAULTS));

  return (
    <Frame path="calculadora de escenario" badge={<SimBadge>{illustrative ? "Supuestos ilustrativos" : "Supuestos editados"}</SimBadge>}>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <div data-focus="roi-inputs">
          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <label key={f.key} htmlFor={`${baseId}-${f.key}`} className="block rounded-xl border border-ink-600/60 bg-ink-950/40 px-3.5 py-2.5">
                <span className="block text-xs leading-snug text-steel-300">{f.label}</span>
                <span className="mt-1.5 flex items-baseline gap-2">
                  <input
                    id={`${baseId}-${f.key}`}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={values[f.key]}
                    onFocus={onInteract}
                    onPointerDown={onInteract}
                    onChange={(e) => {
                      onInteract();
                      setValues((v) => ({ ...v, [f.key]: e.target.value }));
                    }}
                    className="w-full bg-transparent font-mono text-lg text-steel-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-wider text-steel-500">{f.suffix}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn btn-ghost !px-4 !py-2" onClick={() => (onInteract(), setValues(toStrings(ROI_ILLUSTRATIVE_DEFAULTS)))}>
              Valores ilustrativos
            </button>
            <button type="button" className="btn btn-ghost !px-4 !py-2" onClick={() => (onInteract(), setValues(toStrings(ROI_EMPTY)))}>
              Limpiar y capturar los de Pibasa
            </button>
          </div>
        </div>

        <div className="space-y-3" aria-live="polite">
          <div data-focus="roi-time" className="rounded-xl border border-ink-600/60 bg-ink-950/40 p-4">
            <p className="eyebrow">Tiempo administrativo</p>
            <p className="mt-2 font-mono text-2xl">{num1.format(result.hoursSavedPerMonth)} h/mes</p>
            <p className="text-sm text-steel-300">equivale a {mxn0.format(result.timeValueMxn)} al mes</p>
          </div>
          <div data-focus="roi-recovery" className="rounded-xl border border-ink-600/60 bg-ink-950/40 p-4">
            <p className="eyebrow">Oportunidades recuperadas</p>
            <p className="mt-2 font-mono text-2xl">{num1.format(result.recoveredQuotesPerMonth)} cotizaciones/mes</p>
            <p className="text-sm text-steel-300">margen de {mxn0.format(result.recoveredMarginMxn)} al mes</p>
          </div>
          <div data-focus="roi-total" className="rounded-xl border border-signal/30 bg-signal/[0.06] p-4">
            <p className="eyebrow">Escenario mensual total</p>
            <p className="mt-2 font-mono text-3xl text-steel-100">{mxn0.format(result.monthlyTotalMxn)}</p>
            {result.paybackMonths !== null && (
              <p className="mt-1 text-sm text-steel-300">Con la inversión indicada, se recuperaría en ~{num1.format(result.paybackMonths)} meses (en este escenario).</p>
            )}
          </div>
          <p className="text-xs leading-relaxed text-steel-500">
            Un escenario para conversar, no una promesa de ahorro. Los valores iniciales son ilustrativos y no provienen de Pibasa.
          </p>
        </div>
      </div>
    </Frame>
  );
}

function toStrings(i: RoiInputs): Record<keyof RoiInputs, string> {
  return Object.fromEntries(Object.entries(i).map(([k, v]) => [k, String(v)])) as Record<keyof RoiInputs, string>;
}
function toNumbers(s: Record<keyof RoiInputs, string>): RoiInputs {
  return Object.fromEntries(Object.entries(s).map(([k, v]) => [k, Number(v) || 0])) as RoiInputs;
}
