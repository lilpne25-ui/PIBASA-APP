import { conditionLabels, shapeLabels, shapeTypes, type ShapeType } from "@/domain/catalog/shapes";
import type { CatalogRepository, GradeDetail, GradeSummary } from "./ports";

/**
 * DTOs PUBLICOS del catalogo. Lista blanca explicita: solo lo que un visitante anonimo puede ver.
 * No incluyen ids internos, fechas, precios ni estado de activacion. Una prueba verifica las llaves.
 */
export type PublicGradeCard = {
  code: string;
  slug: string;
  name: string;
  family: string;
  summary: string;
  shapes: string[];
  isExample: boolean;
};

export type PublicGradeSheet = PublicGradeCard & {
  densityGcm3: number;
  hardnessAnnealedHbMax: number | null;
  hardnessWorkingHrc: { min: number; max: number } | null;
  ratings: { wearResistance: number | null; toughness: number | null; machinability: number | null };
  heatTreatmentNotes: string | null;
  composition: { element: string; min: number; max: number }[];
  equivalences: { standard: string; designation: string; notes: string | null }[];
  applications: string[];
  sizes: { shape: string; condition: string; label: string; weightPerMeterKg: number }[];
};

export type PublicFacets = {
  families: { code: string; name: string }[];
  shapes: { value: ShapeType; label: string }[];
};

const shapeName = (s: ShapeType) => shapeLabels[s];

export function toPublicCard(g: GradeSummary): PublicGradeCard {
  return {
    code: g.code,
    slug: g.slug,
    name: g.name,
    family: g.familyName,
    summary: g.summary,
    shapes: g.shapes.map(shapeName),
    isExample: g.dataSource === "EXAMPLE"
  };
}

export function toPublicSheet(g: GradeDetail): PublicGradeSheet {
  return {
    ...toPublicCard(g),
    densityGcm3: g.densityGcm3,
    hardnessAnnealedHbMax: g.hardnessAnnealedHbMax,
    hardnessWorkingHrc: g.hardnessWorkingHrc,
    ratings: { ...g.ratings },
    heatTreatmentNotes: g.heatTreatmentNotes,
    composition: Object.entries(g.chemicalComposition ?? {}).map(([element, r]) => ({ element, min: r.min, max: r.max })),
    equivalences: g.equivalences.map((e) => ({ standard: e.standard, designation: e.designation, notes: e.notes })),
    applications: g.applications.map((a) => a.name),
    sizes: g.variants.map((v) => ({
      shape: shapeName(v.shape),
      condition: conditionLabels[v.condition],
      label: v.dimensionLabel,
      weightPerMeterKg: v.weightPerMeterKg
    }))
  };
}

export type PublicListFilter = { familyCode?: string; shape?: string; q?: string };

export class PublicCatalog {
  constructor(private readonly repo: CatalogRepository) {}

  async list(filter: PublicListFilter = {}): Promise<PublicGradeCard[]> {
    const shape = (shapeTypes as readonly string[]).includes(filter.shape ?? "") ? (filter.shape as ShapeType) : undefined;
    const familyCode = /^[A-Z_]{1,30}$/.test(filter.familyCode ?? "") ? filter.familyCode : undefined;
    const q = filter.q?.trim().slice(0, 60) || undefined;
    return (await this.repo.listGrades({ familyCode, shape, q })).map(toPublicCard);
  }

  async facets(): Promise<PublicFacets> {
    const all = await this.repo.listGrades({});
    const families = new Map<string, string>();
    const shapes = new Set<ShapeType>();
    for (const g of all) {
      families.set(g.familyCode, g.familyName);
      g.shapes.forEach((s) => shapes.add(s));
    }
    return {
      families: [...families].map(([code, name]) => ({ code, name })),
      shapes: shapeTypes.filter((s) => shapes.has(s)).map((value) => ({ value, label: shapeName(value) }))
    };
  }

  async sheet(slug: string): Promise<PublicGradeSheet | null> {
    if (!/^[a-z0-9-]{1,40}$/.test(slug)) return null;
    const g = await this.repo.findGradeBySlug(slug);
    return g ? toPublicSheet(g) : null;
  }
}
