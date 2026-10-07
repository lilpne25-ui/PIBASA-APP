import type { Dimensions, ShapeType, SurfaceCondition } from "@/domain/catalog/shapes";

export type DataSourceKind = "EXAMPLE" | "VERIFIED";

export type GradeSummary = {
  code: string;
  slug: string;
  name: string;
  familyCode: string;
  familyName: string;
  summary: string;
  densityGcm3: number;
  dataSource: DataSourceKind;
  shapes: ShapeType[];
};

export type VariantView = {
  id: string;
  shape: ShapeType;
  condition: SurfaceCondition;
  dimensions: Dimensions;
  stockLengthMm: number | null;
  dimensionLabel: string;
  /** Peso por metro (kg/m) para formas lineales; null si no hay largo de referencia. */
  weightPerMeterKg: number;
  dataSource: DataSourceKind;
};

export type GradeDetail = GradeSummary & {
  hardnessAnnealedHbMax: number | null;
  hardnessWorkingHrc: { min: number; max: number } | null;
  ratings: { wearResistance: number | null; toughness: number | null; machinability: number | null };
  heatTreatmentNotes: string | null;
  chemicalComposition: Record<string, { min: number; max: number }> | null;
  equivalences: { standard: string; designation: string; notes: string | null }[];
  applications: { code: string; name: string }[];
  variants: VariantView[];
};

export type GradeFilter = {
  familyCode?: string;
  shape?: ShapeType;
  /** Busqueda por codigo/nombre/equivalencia (insensible a mayusculas). */
  q?: string;
};

export interface CatalogRepository {
  listGrades(filter: GradeFilter): Promise<GradeSummary[]>;
  findGradeBySlug(slug: string): Promise<GradeDetail | null>;
}
