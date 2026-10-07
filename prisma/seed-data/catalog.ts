// DATOS DE EJEMPLO (dataSource = EXAMPLE).
// Valores tipicos de referencia de la literatura general de aceros; NO son datos de Pibasa ni fichas de un
// proveedor. Deben validarse con la lista real de Pibasa y con la ficha tecnica del fabricante antes de
// mostrarse a clientes como dato confirmado. Las medidas son un surtido generico en pulgadas/mm.

import type { ShapeType, SurfaceCondition } from "../../src/domain/catalog/shapes";

export type Range = { min: number; max: number };

export const families = [
  { code: "TOOL_COLD", name: "Herramienta - trabajo en frio", sortOrder: 1, description: "Matrices, punzones y troqueles que trabajan a temperatura ambiente." },
  { code: "TOOL_HOT", name: "Herramienta - trabajo en caliente", sortOrder: 2, description: "Matrices de forja, extrusion y moldes expuestos a temperatura." },
  { code: "TOOL_HSS", name: "Herramienta - alta velocidad", sortOrder: 3, description: "Herramientas de corte que conservan dureza a alta temperatura." },
  { code: "TOOL_SHOCK", name: "Herramienta - resistente al impacto", sortOrder: 4, description: "Cinceles, punzones y piezas sometidas a golpe." },
  { code: "TOOL_WATER", name: "Herramienta - temple en agua", sortOrder: 5, description: "Aceros al carbono de herramienta de temple en agua." },
  { code: "MACHINERY", name: "Maquinaria / carbono", sortOrder: 6, description: "Aceros al carbono para piezas de maquinaria general." }
] as const;

export const applications = [
  { code: "CUTTING_DIES", name: "Troqueles y punzones de corte" },
  { code: "FORGING_DIES", name: "Matrices de forja y extrusion en caliente" },
  { code: "PLASTIC_MOLDS", name: "Moldes de inyeccion de plastico" },
  { code: "DIE_CASTING", name: "Moldes de fundicion a presion" },
  { code: "CUTTING_TOOLS", name: "Herramientas de corte (brocas, machuelos, fresas)" },
  { code: "BLADES", name: "Cuchillas y cizallas" },
  { code: "CHISELS", name: "Cinceles y herramientas de impacto" },
  { code: "SHAFTS", name: "Ejes y flechas" },
  { code: "GENERAL_PARTS", name: "Piezas de maquinaria en general" },
  { code: "GAUGES_JIGS", name: "Calibres, plantillas y dispositivos" }
] as const;

type GradeSeed = {
  code: string;
  slug: string;
  name: string;
  family: (typeof families)[number]["code"];
  summary: string;
  densityGcm3: number;
  hbMax: number | null;
  hrc: [number, number] | null;
  wear: number;
  tough: number;
  mach: number;
  heatTreatment: string;
  composition: Record<string, Range>;
  equivalences: { standard: string; designation: string; notes?: string }[];
  applications: (typeof applications)[number]["code"][];
  sizes: SizeSeed;
};

type SizeSeed = {
  rounds?: { condition: SurfaceCondition; inches: number[] };
  squares?: { condition: SurfaceCondition; inches: number[] };
  flats?: { condition: SurfaceCondition; shape: Extract<ShapeType, "PLATE" | "FLAT_BAR">; thicknessIn: number[]; widthIn: number[] };
};

const ROUNDS_TOOL = [0.5, 0.75, 1, 1.5, 2, 3, 4];
const FLATS_T = [0.25, 0.5, 0.75, 1];
const FLATS_W = [2, 4, 6];

export const grades: GradeSeed[] = [
  {
    code: "D2", slug: "d2", name: "D2 (alto carbono, alto cromo)", family: "TOOL_COLD",
    summary: "Acero de trabajo en frio con muy alta resistencia al desgaste y buena estabilidad dimensional al temple.",
    densityGcm3: 7.7, hbMax: 255, hrc: [58, 62], wear: 5, tough: 2, mach: 2,
    heatTreatment: "Recocido ~870 C; temple ~1010-1040 C; revenido 200-540 C segun dureza objetivo. [EJEMPLO: confirmar con ficha del fabricante]",
    composition: { C: { min: 1.4, max: 1.6 }, Cr: { min: 11, max: 13 }, Mo: { min: 0.7, max: 1.2 }, V: { min: 0.5, max: 1.1 } },
    equivalences: [
      { standard: "DIN/W.Nr", designation: "1.2379", notes: "X153CrMoV12" },
      { standard: "JIS", designation: "SKD11" },
      { standard: "UNS", designation: "T30402" }
    ],
    applications: ["CUTTING_DIES", "BLADES", "GAUGES_JIGS"],
    sizes: {
      rounds: { condition: "ANNEALED", inches: ROUNDS_TOOL },
      flats: { condition: "ANNEALED", shape: "FLAT_BAR", thicknessIn: FLATS_T, widthIn: FLATS_W }
    }
  },
  {
    code: "H13", slug: "h13", name: "H13 (trabajo en caliente)", family: "TOOL_HOT",
    summary: "Acero para trabajo en caliente con buena tenacidad y resistencia a la fatiga termica.",
    densityGcm3: 7.8, hbMax: 229, hrc: [44, 52], wear: 3, tough: 4, mach: 3,
    heatTreatment: "Recocido ~860 C; temple ~1020-1040 C; revenido doble o triple 540-650 C. [EJEMPLO: confirmar con ficha del fabricante]",
    composition: { C: { min: 0.32, max: 0.45 }, Cr: { min: 4.75, max: 5.5 }, Mo: { min: 1.1, max: 1.75 }, V: { min: 0.8, max: 1.2 } },
    equivalences: [
      { standard: "DIN/W.Nr", designation: "1.2344", notes: "X40CrMoV5-1" },
      { standard: "JIS", designation: "SKD61" },
      { standard: "UNS", designation: "T20813" }
    ],
    applications: ["FORGING_DIES", "PLASTIC_MOLDS", "DIE_CASTING"],
    sizes: {
      rounds: { condition: "ANNEALED", inches: ROUNDS_TOOL },
      flats: { condition: "ANNEALED", shape: "FLAT_BAR", thicknessIn: FLATS_T, widthIn: FLATS_W }
    }
  },
  {
    code: "M2", slug: "m2", name: "M2 (acero rapido)", family: "TOOL_HSS",
    summary: "Acero rapido al tungsteno-molibdeno para herramientas de corte con dureza en caliente.",
    densityGcm3: 8.14, hbMax: 255, hrc: [60, 65], wear: 5, tough: 2, mach: 2,
    heatTreatment: "Recocido ~870 C; temple ~1190-1230 C; revenido multiple ~540-560 C. [EJEMPLO: confirmar con ficha del fabricante]",
    composition: { C: { min: 0.78, max: 0.88 }, W: { min: 5.5, max: 6.75 }, Mo: { min: 4.5, max: 5.5 }, Cr: { min: 3.75, max: 4.5 }, V: { min: 1.75, max: 2.2 } },
    equivalences: [
      { standard: "DIN/W.Nr", designation: "1.3343", notes: "HS6-5-2C" },
      { standard: "JIS", designation: "SKH51" },
      { standard: "UNS", designation: "T11302" }
    ],
    applications: ["CUTTING_TOOLS"],
    sizes: { rounds: { condition: "ANNEALED", inches: [0.25, 0.5, 0.75, 1, 1.5, 2] } }
  },
  {
    code: "O1", slug: "o1", name: "O1 (temple en aceite)", family: "TOOL_COLD",
    summary: "Acero de temple en aceite, buena maquinabilidad y estabilidad; uso general en herramental.",
    densityGcm3: 7.85, hbMax: 229, hrc: [57, 62], wear: 3, tough: 3, mach: 4,
    heatTreatment: "Recocido ~760 C; temple ~790-815 C en aceite; revenido 150-425 C. [EJEMPLO: confirmar con ficha del fabricante]",
    composition: { C: { min: 0.85, max: 1.0 }, Mn: { min: 1.0, max: 1.4 }, Cr: { min: 0.4, max: 0.6 }, W: { min: 0.4, max: 0.6 } },
    equivalences: [
      { standard: "DIN/W.Nr", designation: "1.2510", notes: "100MnCrW4" },
      { standard: "JIS", designation: "SKS3" },
      { standard: "UNS", designation: "T31501" }
    ],
    applications: ["CUTTING_DIES", "GAUGES_JIGS", "BLADES"],
    sizes: {
      rounds: { condition: "GROUND", inches: ROUNDS_TOOL },
      flats: { condition: "GROUND", shape: "FLAT_BAR", thicknessIn: FLATS_T, widthIn: FLATS_W }
    }
  },
  {
    code: "S1", slug: "s1", name: "S1 (resistente al impacto)", family: "TOOL_SHOCK",
    summary: "Acero al cromo-tungsteno resistente al impacto para cinceles, punzones y herramienta de golpe.",
    densityGcm3: 7.83, hbMax: 229, hrc: [40, 58], wear: 3, tough: 5, mach: 3,
    heatTreatment: "Recocido ~790 C; temple ~900-950 C en aceite; revenido 200-650 C segun aplicacion. [EJEMPLO: confirmar con ficha del fabricante]",
    composition: { C: { min: 0.4, max: 0.55 }, Cr: { min: 1.0, max: 1.8 }, W: { min: 1.5, max: 3.0 }, Si: { min: 0.15, max: 1.2 } },
    equivalences: [{ standard: "UNS", designation: "T41901" }],
    applications: ["CHISELS", "CUTTING_DIES"],
    sizes: { rounds: { condition: "HOT_ROLLED", inches: [0.5, 0.75, 1, 1.5, 2, 3] } }
  },
  {
    code: "W2", slug: "w2", name: "W2 (temple en agua)", family: "TOOL_WATER",
    summary: "Acero al carbono de herramienta de temple en agua, alta dureza superficial.",
    densityGcm3: 7.83, hbMax: 207, hrc: [58, 64], wear: 2, tough: 2, mach: 5,
    heatTreatment: "Recocido ~760 C; temple ~790-815 C en agua o salmuera; revenido 150-300 C. [EJEMPLO: confirmar con ficha del fabricante]",
    composition: { C: { min: 0.85, max: 1.5 }, Mn: { min: 0.1, max: 0.4 }, V: { min: 0.15, max: 0.35 } },
    equivalences: [{ standard: "UNS", designation: "T72302" }],
    applications: ["CUTTING_TOOLS", "GAUGES_JIGS"],
    sizes: { rounds: { condition: "GROUND", inches: [0.25, 0.5, 0.75, 1, 1.5] } }
  },
  ...(
    [
      ["1018", "1018 (bajo carbono)", "G10180", 0.15, 0.2, 1, 3, 5, "Acero de bajo carbono, muy soldable y maquinable; bajo para cementar."],
      ["1020", "1020 (bajo carbono)", "G10200", 0.18, 0.23, 1, 3, 5, "Acero de bajo carbono de uso general en piezas de maquinaria y estructura."],
      ["1026", "1026 (bajo carbono, mayor resistencia)", "G10260", 0.22, 0.28, 1, 3, 4, "Bajo carbono con algo mas de resistencia que 1020 para ejes y piezas maquinadas."],
      ["1045", "1045 (medio carbono)", "G10450", 0.43, 0.5, 2, 3, 4, "Medio carbono templable; ejes, engranes y piezas de mayor resistencia mecanica."]
    ] as const
  ).map(([code, name, uns, cMin, cMax, wear, tough, mach, summary]): GradeSeed => ({
    code, slug: code, name, family: "MACHINERY", summary, densityGcm3: 7.85,
    hbMax: null, hrc: null, wear, tough, mach,
    heatTreatment: "Normalizado/estirado en frio segun suministro; 1045 admite temple y revenido. [EJEMPLO: confirmar con ficha del fabricante]",
    composition: { C: { min: cMin, max: cMax } },
    equivalences: [{ standard: "UNS", designation: uns }, { standard: "AISI/SAE", designation: code }],
    applications: ["SHAFTS", "GENERAL_PARTS"],
    sizes: {
      rounds: { condition: "COLD_DRAWN", inches: [0.5, 0.75, 1, 1.5, 2, 3, 4] },
      squares: { condition: "COLD_DRAWN", inches: [0.5, 0.75, 1, 1.5, 2] },
      flats: { condition: "HOT_ROLLED", shape: "PLATE", thicknessIn: FLATS_T, widthIn: FLATS_W }
    }
  }))
];
