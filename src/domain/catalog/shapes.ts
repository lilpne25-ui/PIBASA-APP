// Dominio del catalogo: formas, dimensiones y peso teorico. Funciones puras, sin framework.

export const shapeTypes = ["PLATE", "ROUND_BAR", "SQUARE_BAR", "FLAT_BAR", "TUBE"] as const;
export type ShapeType = (typeof shapeTypes)[number];

export const surfaceConditions = ["HOT_ROLLED", "COLD_DRAWN", "GROUND", "ANNEALED"] as const;
export type SurfaceCondition = (typeof surfaceConditions)[number];

export const shapeLabels: Record<ShapeType, string> = {
  PLATE: "Placa",
  ROUND_BAR: "Redondo",
  SQUARE_BAR: "Cuadrado",
  FLAT_BAR: "Solera",
  TUBE: "Tubo"
};

export const conditionLabels: Record<SurfaceCondition, string> = {
  HOT_ROLLED: "Laminado en caliente",
  COLD_DRAWN: "Estirado en frio",
  GROUND: "Rectificado",
  ANNEALED: "Recocido"
};

/** Dimensiones en milimetros. Solo se usan las que exige cada forma. */
export type Dimensions = {
  thicknessMm?: number | null;
  widthMm?: number | null;
  diameterMm?: number | null;
  sideMm?: number | null;
  wallMm?: number | null;
};

type DimKey = keyof Dimensions;

/** Dimensiones obligatorias por forma. */
export const requiredDimensions: Record<ShapeType, readonly DimKey[]> = {
  PLATE: ["thicknessMm", "widthMm"],
  FLAT_BAR: ["thicknessMm", "widthMm"],
  ROUND_BAR: ["diameterMm"],
  SQUARE_BAR: ["sideMm"],
  TUBE: ["diameterMm", "wallMm"]
};

export const INCH_MM = 25.4;
export const inchToMm = (inches: number) => Math.round(inches * INCH_MM * 1000) / 1000;

const isPositive = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n > 0;

/** Devuelve la lista de problemas ([] si es valida). */
export function validateDimensions(shape: ShapeType, dims: Dimensions, lengthMm?: number | null): string[] {
  const problems: string[] = [];
  const required = requiredDimensions[shape];
  for (const key of required) {
    if (!isPositive(dims[key])) problems.push(`${key} es obligatorio y debe ser > 0 para ${shape}`);
  }
  const allKeys: DimKey[] = ["thicknessMm", "widthMm", "diameterMm", "sideMm", "wallMm"];
  for (const key of allKeys) {
    const v = dims[key];
    if (!required.includes(key) && v !== null && v !== undefined) {
      problems.push(`${key} no aplica a ${shape}`);
    }
  }
  if (lengthMm !== null && lengthMm !== undefined && !isPositive(lengthMm)) {
    problems.push("lengthMm debe ser > 0");
  }
  if (shape === "TUBE" && isPositive(dims.diameterMm) && isPositive(dims.wallMm) && dims.wallMm * 2 >= dims.diameterMm) {
    problems.push("wallMm debe ser menor que la mitad del diametro");
  }
  return problems;
}

const fmt = (n: number | null | undefined) => (n === null || n === undefined ? "-" : String(Number(n.toFixed(3))));

/** Llave determinista (misma medida => misma llave). Evita duplicados aunque haya columnas NULL. */
export function dimensionKey(input: {
  gradeCode: string;
  shape: ShapeType;
  condition: SurfaceCondition;
  dims: Dimensions;
  stockLengthMm?: number | null;
}): string {
  const d = input.dims;
  return [
    input.gradeCode.toUpperCase(),
    input.shape,
    input.condition,
    `t${fmt(d.thicknessMm)}`,
    `w${fmt(d.widthMm)}`,
    `d${fmt(d.diameterMm)}`,
    `s${fmt(d.sideMm)}`,
    `wl${fmt(d.wallMm)}`,
    `L${fmt(input.stockLengthMm ?? null)}`
  ].join("|");
}

/** Area de la seccion transversal en mm2 (forma lineal). */
export function crossSectionAreaMm2(shape: ShapeType, dims: Dimensions): number {
  const problems = validateDimensions(shape, dims);
  if (problems.length) throw new Error(problems.join("; "));
  switch (shape) {
    case "PLATE":
    case "FLAT_BAR":
      return dims.thicknessMm! * dims.widthMm!;
    case "ROUND_BAR":
      return (Math.PI * dims.diameterMm! ** 2) / 4;
    case "SQUARE_BAR":
      return dims.sideMm! ** 2;
    case "TUBE": {
      const inner = dims.diameterMm! - 2 * dims.wallMm!;
      return (Math.PI * (dims.diameterMm! ** 2 - inner ** 2)) / 4;
    }
  }
}

/**
 * Peso teorico en kg = area(mm2) * largo(mm) = mm3 -> /1e6 = dm3 (litros) * densidad(kg/dm3 = g/cm3).
 * Es un calculo teorico: la tolerancia real del material cambia el peso.
 */
export function theoreticalWeightKg(
  shape: ShapeType,
  dims: Dimensions,
  lengthMm: number,
  densityGcm3: number
): number {
  if (!isPositive(lengthMm)) throw new Error("lengthMm debe ser > 0");
  if (!isPositive(densityGcm3)) throw new Error("densityGcm3 debe ser > 0");
  const volumeDm3 = (crossSectionAreaMm2(shape, dims) * lengthMm) / 1_000_000;
  return volumeDm3 * densityGcm3;
}

/** Peso por metro lineal (kg/m). */
export const weightPerMeterKg = (shape: ShapeType, dims: Dimensions, densityGcm3: number) =>
  theoreticalWeightKg(shape, dims, 1000, densityGcm3);

/** Etiqueta legible de la medida, en mm. Ej.: "Ø 50.8 mm", "12.7 x 152.4 mm". */
export function dimensionLabel(shape: ShapeType, dims: Dimensions): string {
  switch (shape) {
    case "ROUND_BAR":
      return `Ø ${fmt(dims.diameterMm)} mm`;
    case "SQUARE_BAR":
      return `${fmt(dims.sideMm)} x ${fmt(dims.sideMm)} mm`;
    case "PLATE":
    case "FLAT_BAR":
      return `${fmt(dims.thicknessMm)} x ${fmt(dims.widthMm)} mm`;
    case "TUBE":
      return `Ø ${fmt(dims.diameterMm)} x ${fmt(dims.wallMm)} mm`;
  }
}
