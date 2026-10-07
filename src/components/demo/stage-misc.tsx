import { VluxMark } from "@/components/vlux-mark";
import { PibasaWordmark } from "./pibasa-wordmark";
import { Reveal, type StageProps } from "./stage-parts";

/* ---------- Portada / bienvenida ---------- */
export function WelcomeStage({ step }: StageProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-600/60 bg-ink-900/40 px-6 py-10 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal/[0.09] blur-3xl"
      />
      <div className="relative flex flex-col items-center justify-center gap-6 md:flex-row md:gap-12">
        <PibasaWordmark size="xl" />
        <div className="flex items-center gap-4 text-steel-500">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-ink-600" />
          <span className="font-mono text-xs uppercase tracking-[0.3em]">x</span>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-ink-600" />
        </div>
        <VluxMark height={92} withWordmark />
      </div>
      <div className="relative mx-auto mt-8 grid max-w-3xl gap-3 text-left sm:grid-cols-2">
        <Reveal on={step >= 1}>
          <div className="rounded-xl border border-signal/30 bg-signal/[0.06] p-4">
            <span className="chip chip-active">Real</span>
            <p className="mt-3 text-sm text-steel-300">Catálogo técnico público, ya construido, con medidas y peso teórico.</p>
          </div>
        </Reveal>
        <Reveal on={step >= 2}>
          <div className="rounded-xl border border-amber/30 bg-amber/[0.06] p-4">
            <span className="chip chip-warn">Simulación</span>
            <p className="mt-3 text-sm text-steel-300">Cotizador, folio, WhatsApp, seguimiento y reportes, con datos de ejemplo.</p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ---------- Alcance por fases ---------- */
const phase1 = [
  "Catálogo técnico público",
  "Cotizador con peso y precio estimado",
  "WhatsApp o formulario, con folio",
  "Panel de seguimiento",
  "PDF de cotización",
  "Consulta por folio",
  "Envíos nacionales"
];
const phase2 = ["Bot de WhatsApp de captura guiada", "Reportes de conversión y tiempos"];
const phase3 = ["Inventario / existencias", "Facturación o ERP", "Tarifas de paquetería por API"];
const validate = [
  "Lista real de grados y medidas",
  "Lista de precios y reglas de corte",
  "Su proceso de cotización actual",
  "Número de WhatsApp y roles del equipo"
];

function Phase({ n, name, time, items, dim = false, focus }: { n: string; name: string; time: string; items: string[]; dim?: boolean; focus: string }) {
  return (
    <div data-focus={focus} className={`panel p-5 ${dim ? "opacity-90" : ""}`}>
      <p className="eyebrow">Fase {n}</p>
      <h3 className="mt-2 text-lg font-semibold">{name}</h3>
      <p className="font-mono text-xs text-steel-500">{time}</p>
      <ul className="mt-4 space-y-2 text-sm text-steel-300">
        {items.map((i) => (
          <li key={i} className="flex gap-2.5">
            <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal/70" />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ScopeStage({ step }: StageProps) {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        <Phase n="1" name="MVP" time="6 a 8 semanas (estimado)" items={phase1} focus="phase-1" />
        <Reveal on={step >= 1}>
          <Phase n="2" name="Automatización" time="3 a 4 semanas (estimado)" items={phase2} focus="phase-2" />
        </Reveal>
        <Reveal on={step >= 1}>
          <Phase n="3" name="Opcional" time="por definir, no incluida" items={phase3} dim focus="phase-3" />
        </Reveal>
      </div>
      <Reveal on={step >= 2}>
        <div data-focus="validate" className="mt-4 rounded-xl border border-amber/30 bg-amber/[0.05] p-5">
          <p className="eyebrow !text-amber/90">Qué se valida con Pibasa antes de construirlo</p>
          <ul className="mt-3 grid gap-2 text-sm text-steel-300 sm:grid-cols-2">
            {validate.map((v) => (
              <li key={v} className="flex gap-2.5">
                <span aria-hidden="true" className="text-amber">
                  ›
                </span>
                {v}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </div>
  );
}

/* ---------- Cierre ---------- */
const nextSteps = [
  { n: "1", t: "Validar su catálogo", d: "Lista real de grados, medidas y fichas." },
  { n: "2", t: "Entender cómo cotizan hoy", d: "Quién cotiza, cómo fijan precio, cuánto tardan." },
  { n: "3", t: "Afinar el alcance de la Fase 1", d: "Con sus datos, no con supuestos." }
];

export function CloseStage({ step }: StageProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-600/60 bg-ink-900/40 px-6 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-signal/[0.08] blur-3xl"
      />
      <div className="relative grid gap-4 md:grid-cols-3">
        {nextSteps.map((s, i) => (
          <Reveal key={s.n} on={step >= i + 1}>
            <div className="panel h-full p-5">
              <span className="font-mono text-3xl text-steel-500">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-steel-300">{s.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="relative mt-12 flex items-center justify-center gap-6">
        <PibasaWordmark size="md" />
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-steel-500">x</span>
        <VluxMark height={52} withWordmark />
      </div>
    </div>
  );
}
