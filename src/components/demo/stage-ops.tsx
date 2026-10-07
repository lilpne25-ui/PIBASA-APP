import { DEMO_FOLIO } from "@/domain/demo/quote-sim";
import { Frame, Reveal, SimBadge, type StageProps } from "./stage-parts";

/* ---------- Escena "Hoy": una cotizacion armada por conversacion (escenario ilustrativo) ---------- */

const chat: { from: "client" | "seller"; text: string; at: number }[] = [
  { from: "client", text: "Buenas tardes, ¿manejan acero D2 en solera?", at: 1 },
  { from: "seller", text: "Sí. ¿Qué medida, cuántas piezas y a dónde va?", at: 2 },
  { from: "client", text: "1/2 por 4, cuatro piezas de 30 cm. Es para León. ¿Cuánto?", at: 3 },
  { from: "seller", text: "Déjame calcular el peso, el corte y el flete y te confirmo…", at: 4 }
];

const checklist: { label: string; done: number }[] = [
  { label: "Grado: D2", done: 1 },
  { label: "Medida y cantidad", done: 3 },
  { label: "Destino", done: 3 },
  { label: "Peso teórico", done: 99 },
  { label: "Corte y flete", done: 99 },
  { label: "Folio para dar seguimiento", done: 99 }
];

export function TodayStage({ step }: StageProps) {
  return (
    <Frame path="escenario ilustrativo del giro" badge={<SimBadge>Por validar con Pibasa</SimBadge>}>
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div data-focus="chat" className="min-h-[260px] space-y-3 rounded-xl bg-ink-950/60 p-4">
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.25em] text-steel-500">Taller de matricería · León</p>
          {chat.map((m) => (
            <Reveal key={m.text} on={step >= m.at} className={m.from === "seller" ? "ml-auto max-w-[85%]" : "max-w-[85%]"}>
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.from === "seller" ? "rounded-tr-sm bg-signal/[0.1] text-steel-100" : "rounded-tl-sm bg-ink-700 text-steel-100"
                }`}
              >
                {m.text}
              </div>
            </Reveal>
          ))}
        </div>
        <div data-focus="checklist" className="rounded-xl border border-ink-600/60 bg-ink-950/40 p-5">
          <p className="eyebrow">Lo que alguien reconstruye a mano</p>
          <ul className="mt-4 space-y-3">
            {checklist.map((c) => {
              const done = step >= c.done;
              const pending = step >= 4 && c.done === 99;
              return (
                <li key={c.label} className="flex items-center gap-3 text-sm">
                  <span
                    aria-hidden="true"
                    className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] transition-colors duration-500 ${
                      done ? "border-signal bg-signal/20 text-signal" : pending ? "border-amber/60 text-amber" : "border-ink-600 text-transparent"
                    }`}
                  >
                    {done ? "✓" : pending ? "!" : "·"}
                  </span>
                  <span className={done ? "text-steel-100" : pending ? "text-amber" : "text-steel-500"}>{c.label}</span>
                  {pending && <span className="ml-auto text-xs text-steel-500">a mano</span>}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </Frame>
  );
}

/* ---------- Panel interno de seguimiento (simulado) ---------- */

const columns = ["Nueva", "En cotización", "Enviada", "Seguimiento", "Cerradas"] as const;

type BoardCard = { col: number; client: string; item: string; folio: string; note?: string; tone?: "won" | "lost" };
const staticCards: BoardCard[] = [
  { col: 1, client: "Cliente ficticio 1", item: "H13 · Redondo Ø 2 in", folio: "PIB-DEMO-0002" },
  { col: 2, client: "Cliente ficticio 2", item: "M2 · Redondo Ø 1 in", folio: "PIB-DEMO-0003", note: "PDF enviado" },
  { col: 3, client: "Cliente ficticio 3", item: "1045 · Cuadrado 2 in", folio: "PIB-DEMO-0004", note: "Recordatorio mañana" },
  { col: 4, client: "Cliente ficticio 4", item: "O1 · Solera 1/2 x 4", folio: "PIB-DEMO-0005", note: "Ganada", tone: "won" },
  { col: 4, client: "Cliente ficticio 5", item: "D2 · Redondo Ø 3 in", folio: "PIB-DEMO-0006", note: "Perdida · motivo: precio", tone: "lost" }
];

function CardView({ c, demo = false }: { c: BoardCard; demo?: boolean }) {
  return (
    <div
      data-focus={demo ? "card-demo" : undefined}
      className={`rise-in rounded-xl border p-3 text-xs ${
        demo ? "border-signal/50 bg-signal/[0.09] shadow-[0_0_30px_-10px_rgba(111,183,201,0.6)]" : "border-ink-600/60 bg-ink-950/50"
      }`}
    >
      <p className="font-mono text-steel-100">{c.item}</p>
      <p className="mt-1 text-steel-300">{c.client}</p>
      <p className="mt-2 font-mono text-[10px] text-steel-500">{c.folio}</p>
      {c.note && (
        <p className={`mt-1.5 ${c.tone === "won" ? "text-signal" : c.tone === "lost" ? "text-amber" : "text-steel-300"}`}>{c.note}</p>
      )}
    </div>
  );
}

export function PanelStage({ step }: StageProps) {
  const demoCol = step <= 0 ? -1 : Math.min(step - 1, 3);
  const demoNotes = ["Recibida por formulario", "Revisando precio y corte", "PDF enviado", "Recordatorio mañana 9:00"];
  return (
    <Frame path="pibasa / cotizaciones · simulación" badge={<SimBadge>Cotizaciones ficticias</SimBadge>}>
      <div data-focus="board" className="grid min-h-[280px] grid-cols-2 gap-3 md:grid-cols-5">
        {columns.map((name, ci) => (
          <div key={name} className="rounded-xl bg-ink-950/40 p-2.5">
            <p className="px-1 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-steel-500">{name}</p>
            <div className="space-y-2.5">
              {demoCol === ci && (
                <CardView
                  key={`demo-${ci}`}
                  demo
                  c={{ col: ci, client: "Taller de matricería · León", item: "D2 · Solera 12.7 x 101.6", folio: DEMO_FOLIO, note: demoNotes[ci] }}
                />
              )}
              {staticCards
                .filter((c) => c.col === ci)
                .map((c) => (
                  <CardView key={c.folio} c={c} />
                ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-steel-500">
        Estados propuestos (se validan con Pibasa). Cada cambio queda en el historial de la cotización.
      </p>
    </Frame>
  );
}

/* ---------- Vista del dueno (cifras ilustrativas) ---------- */

const kpis = [
  { label: "Cotizaciones del mes", value: "47" },
  { label: "En seguimiento", value: "12" },
  { label: "Ganadas", value: "9" },
  { label: "Primera respuesta", value: "38 min" }
];
const funnel = [
  { label: "Recibidas", n: 47 },
  { label: "Cotizadas", n: 41 },
  { label: "Enviadas", n: 36 },
  { label: "Ganadas", n: 9 }
];
const lost = [
  { label: "Precio", pct: 38 },
  { label: "Tiempo de entrega", pct: 24 },
  { label: "Sin respuesta del cliente", pct: 21 },
  { label: "Otro", pct: 17 }
];

export function OwnerStage({ step }: StageProps) {
  return (
    <Frame path="pibasa / resumen · simulación" badge={<SimBadge>Cifras ilustrativas</SimBadge>}>
      <div data-focus="kpis" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-ink-600/60 bg-ink-950/40 p-4">
            <p className="font-mono text-3xl tracking-tight text-steel-100">{k.value}</p>
            <p className="mt-2 text-xs text-steel-500">{k.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Reveal on={step >= 1}>
          <div data-focus="funnel" className="rounded-xl border border-ink-600/60 bg-ink-950/40 p-5">
            <p className="eyebrow">Del primer mensaje al cierre</p>
            <ul className="mt-4 space-y-3">
              {funnel.map((f) => (
                <li key={f.label} className="grid grid-cols-[6rem_1fr_2rem] items-center gap-3 text-sm">
                  <span className="text-steel-300">{f.label}</span>
                  <span className="h-1.5 rounded-full bg-ink-700" aria-hidden="true">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-steel-300/70 to-signal/70 transition-[width] duration-1000 ease-spring"
                      style={{ width: step >= 1 ? `${(f.n / 47) * 100}%` : "0%" }}
                    />
                  </span>
                  <span className="text-right font-mono text-steel-300">{f.n}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal on={step >= 2}>
          <div data-focus="lost-reasons" className="rounded-xl border border-ink-600/60 bg-ink-950/40 p-5">
            <p className="eyebrow">Por qué se pierden</p>
            <ul className="mt-4 space-y-3">
              {lost.map((l) => (
                <li key={l.label} className="grid grid-cols-[9rem_1fr_2.5rem] items-center gap-3 text-sm">
                  <span className="text-steel-300">{l.label}</span>
                  <span className="h-1.5 rounded-full bg-ink-700" aria-hidden="true">
                    <span
                      className="block h-full rounded-full bg-amber/60 transition-[width] duration-1000 ease-spring"
                      style={{ width: step >= 2 ? `${l.pct}%` : "0%" }}
                    />
                  </span>
                  <span className="text-right font-mono text-steel-300">{l.pct}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
      <Reveal on={step >= 3}>
        <p data-focus="phase-note" className="mt-3 rounded-xl border border-amber/30 bg-amber/[0.06] px-4 py-3 text-sm text-steel-300">
          Cifras inventadas para mostrar la idea. Reportes de conversión y tiempos con datos reales: Fase 2, a partir de las cotizaciones que
          el equipo registre.
        </p>
      </Reveal>
    </Frame>
  );
}
