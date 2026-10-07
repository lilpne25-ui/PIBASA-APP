import narration from "./narration.json";

export type DemoVoice = "mujer" | "hombre";
export const demoVoices: readonly DemoVoice[] = ["mujer", "hombre"];
export const voiceLabels: Record<DemoVoice, string> = {
  mujer: narration.voices.mujer.label,
  hombre: narration.voices.hombre.label
};

export type SceneView =
  | "welcome"
  | "today"
  | "catalog"
  | "quote"
  | "folio"
  | "panel"
  | "owner"
  | "scope"
  | "roi"
  | "close";

/** Un "beat" cambia el paso del escenario cuando la escena alcanza `at` (fraccion 0-1 de su duracion). */
export type Beat = { at: number; focus?: string };

export type DemoScene = {
  id: string;
  chapter: string;
  /** Una idea, maximo 8 palabras. */
  title: string;
  /** `NN / VERBO` */
  label: string;
  /** Narracion (fuente unica: narration.json). */
  text: string;
  takeaway: string;
  /** Selector `data-focus` que se resalta al inicio de la escena. */
  target?: string;
  view: SceneView;
  /** Los pasos son funcion del avance de la escena, asi subtitulos, resaltado y audio nunca se desfasan. */
  beats: Beat[];
};

const textOf = (id: string): string => {
  const s = narration.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`narration.json no tiene la escena ${id}`);
  return s.text;
};

export const scenes: DemoScene[] = [
  {
    id: "welcome",
    chapter: "Bienvenida",
    title: "Cotizar acero a medida, en minutos.",
    label: "PIBASA × VLUX",
    text: textOf("welcome"),
    takeaway: "Catálogo real. Todo lo demás, simulación con datos de ejemplo.",
    view: "welcome",
    beats: [{ at: 0.35 }, { at: 0.6 }]
  },
  {
    id: "today",
    chapter: "Hoy",
    title: "Hoy, una cotización se arma conversando.",
    label: "01 / ENTENDER",
    text: textOf("today"),
    takeaway: "Escenario ilustrativo del giro, por validar con Pibasa.",
    target: "chat",
    view: "today",
    beats: [{ at: 0.18 }, { at: 0.34 }, { at: 0.5 }, { at: 0.68, focus: "checklist" }]
  },
  {
    id: "catalog",
    chapter: "Catálogo",
    title: "Primero, el cliente encuentra el acero.",
    label: "02 / BUSCAR",
    text: textOf("catalog"),
    takeaway: "Catálogo técnico real · valores de ejemplo hasta validarlos.",
    target: "search",
    view: "catalog",
    beats: [
      { at: 0.16, focus: "grade-d2" },
      { at: 0.34, focus: "sheet-props" },
      { at: 0.62, focus: "sheet-sizes" }
    ]
  },
  {
    id: "quote",
    chapter: "Cotizador",
    title: "Medidas, corte y destino en un solo lugar.",
    label: "03 / COTIZAR",
    text: textOf("quote"),
    takeaway: "Peso teórico real del catálogo · precios ilustrativos.",
    target: "quote-form",
    view: "quote",
    beats: [
      { at: 0.1, focus: "q-grade" },
      { at: 0.24, focus: "q-size" },
      { at: 0.44, focus: "q-qty" },
      { at: 0.58, focus: "q-dest" },
      { at: 0.72, focus: "q-total" }
    ]
  },
  {
    id: "folio",
    chapter: "Folio y WhatsApp",
    title: "Un folio. Un mensaje completo.",
    label: "04 / ENVIAR",
    text: textOf("folio"),
    takeaway: "Envío simulado · el taller consulta su folio sin cuenta.",
    target: "wa-card",
    view: "folio",
    beats: [
      { at: 0.14, focus: "wa-message" },
      { at: 0.36, focus: "wa-folio" },
      { at: 0.58, focus: "consult-card" },
      { at: 0.8, focus: "consult-timeline" }
    ]
  },
  {
    id: "panel",
    chapter: "Seguimiento",
    title: "Pibasa ve cada solicitud en su estado.",
    label: "05 / DAR SEGUIMIENTO",
    text: textOf("panel"),
    takeaway: "Panel simulado · cotizaciones ficticias.",
    target: "board",
    view: "panel",
    beats: [
      { at: 0.2, focus: "card-demo" },
      { at: 0.4, focus: "card-demo" },
      { at: 0.6, focus: "card-demo" },
      { at: 0.8, focus: "card-demo" }
    ]
  },
  {
    id: "owner",
    chapter: "Vista del dueño",
    title: "Así lo ve quien dirige el negocio.",
    label: "06 / DECIDIR",
    text: textOf("owner"),
    takeaway: "Cifras ilustrativas · reportes completos en Fase 2.",
    target: "kpis",
    view: "owner",
    beats: [{ at: 0.3, focus: "funnel" }, { at: 0.55, focus: "lost-reasons" }, { at: 0.8, focus: "phase-note" }]
  },
  {
    id: "scope",
    chapter: "Alcance",
    title: "Un alcance claro, por fases.",
    label: "07 / ACORDAR",
    text: textOf("scope"),
    takeaway: "Fase 1 en 6 a 8 semanas · Fase 2 después de validar.",
    target: "phase-1",
    view: "scope",
    beats: [{ at: 0.52, focus: "phase-2" }, { at: 0.82, focus: "validate" }]
  },
  {
    id: "roi",
    chapter: "Retorno",
    title: "Y el valor, con sus propios números.",
    label: "08 / CALCULAR",
    text: textOf("roi"),
    takeaway: "Un escenario para conversar, no una promesa de ahorro.",
    target: "roi-inputs",
    view: "roi",
    beats: [{ at: 0.4, focus: "roi-time" }, { at: 0.62, focus: "roi-recovery" }, { at: 0.82, focus: "roi-total" }]
  },
  {
    id: "close",
    chapter: "Siguiente paso",
    title: "Sigamos con los datos de Pibasa.",
    label: "09 / CONTINUAR",
    text: textOf("close"),
    takeaway: "Siguiente paso: validar grados, medidas, precios y su proceso.",
    view: "close",
    beats: [{ at: 0.3 }, { at: 0.52 }, { at: 0.74 }]
  }
];

/** Ruta publica del MP3 esperado de una escena. */
export const audioPath = (sceneId: string, voice: DemoVoice) => `/demo/narration/${sceneId}-${voice}.mp3`;

/** Pasos activos segun el avance (0-1) de la escena. */
export const stepAt = (scene: DemoScene, progress: number) => scene.beats.filter((b) => progress >= b.at).length;

/** Selector a resaltar en el paso dado. */
export const focusAt = (scene: DemoScene, step: number): string | undefined =>
  step > 0 ? (scene.beats[step - 1]?.focus ?? scene.target) : scene.target;

/** Duracion estimada de lectura (modo sin audio). */
export const readingMs = (scene: DemoScene) => Math.max(11_000, scene.text.split(/\s+/).length * 430);

/** Lista exacta de MP3 que debe generar ElevenLabs. */
export function expectedAudioFiles() {
  return narration.scenes.flatMap((s) =>
    (s.voice as DemoVoice[]).map((voice) => ({ id: s.id, voice, file: `${s.id}-${voice}.mp3`, text: s.text }))
  );
}
