import type { PublicCatalog, PublicGradeCard, PublicGradeSheet } from "@/application/catalog/public-catalog";

/**
 * Datos que la demo toma del catalogo REAL (DTO publico, sin ids internos ni precios).
 * Si la base de datos no responde, la demo no se rompe en plena reunion: usa una muestra minima local
 * y lo declara en pantalla (`source: "fallback"`).
 */
export type DemoData = {
  source: "catalog" | "fallback";
  cards: PublicGradeCard[];
  totalGrades: number;
  d2: PublicGradeSheet;
};

const FALLBACK_D2: PublicGradeSheet = {
  code: "D2",
  slug: "d2",
  name: "D2 (alto carbono, alto cromo)",
  family: "Aceros de herramienta para trabajo en frio",
  summary: "Acero de trabajo en frio con muy alta resistencia al desgaste y buena estabilidad dimensional al temple.",
  shapes: ["Redondo", "Solera"],
  isExample: true,
  densityGcm3: 7.7,
  hardnessAnnealedHbMax: 255,
  hardnessWorkingHrc: { min: 58, max: 62 },
  ratings: { wearResistance: 5, toughness: 2, machinability: 2 },
  heatTreatmentNotes: null,
  composition: [
    { element: "C", min: 1.4, max: 1.6 },
    { element: "Cr", min: 11, max: 13 },
    { element: "Mo", min: 0.7, max: 1.2 },
    { element: "V", min: 0.5, max: 1.1 }
  ],
  equivalences: [
    { standard: "DIN/W.Nr", designation: "1.2379", notes: "X153CrMoV12" },
    { standard: "JIS", designation: "SKD11", notes: null },
    { standard: "UNS", designation: "T30402", notes: null }
  ],
  applications: ["Troqueles de corte", "Cuchillas", "Calibres y plantillas"],
  sizes: [{ shape: "Solera", condition: "Recocido", label: "12.7 x 101.6 mm", weightPerMeterKg: 9.94 }]
};

export function fallbackDemoData(): DemoData {
  const { code, slug, name, family, summary, shapes, isExample } = FALLBACK_D2;
  return {
    source: "fallback",
    cards: [{ code, slug, name, family, summary, shapes, isExample }],
    totalGrades: 1,
    d2: FALLBACK_D2
  };
}

const MAX_CARDS = 6;

export async function loadDemoData(catalog: Pick<PublicCatalog, "list" | "sheet">): Promise<DemoData> {
  try {
    const [all, d2] = await Promise.all([catalog.list(), catalog.sheet("d2")]);
    if (!d2 || all.length === 0) return fallbackDemoData();
    const ordered = [...all].sort((a, b) => Number(b.slug === "d2") - Number(a.slug === "d2"));
    return { source: "catalog", cards: ordered.slice(0, MAX_CARDS), totalGrades: all.length, d2 };
  } catch {
    return fallbackDemoData();
  }
}
