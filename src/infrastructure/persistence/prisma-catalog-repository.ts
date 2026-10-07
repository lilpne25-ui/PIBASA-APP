import type { Prisma } from "@prisma/client";
import type {
  CatalogRepository,
  GradeDetail,
  GradeFilter,
  GradeSummary,
  VariantView
} from "@/application/catalog/ports";
import { dimensionLabel, weightPerMeterKg, type ShapeType } from "@/domain/catalog/shapes";
import { prisma } from "./prisma-client";

const num = (v: Prisma.Decimal | null): number | null => (v === null ? null : Number(v));

type GradeWithRels = Prisma.SteelGradeGetPayload<{
  include: { family: true; variants: { select: { shape: true } } };
}>;

function toSummary(g: GradeWithRels): GradeSummary {
  return {
    code: g.code,
    slug: g.slug,
    name: g.name,
    familyCode: g.family.code,
    familyName: g.family.name,
    summary: g.summary,
    densityGcm3: Number(g.densityGcm3),
    dataSource: g.dataSource,
    shapes: [...new Set(g.variants.map((v) => v.shape as ShapeType))]
  };
}

export class PrismaCatalogRepository implements CatalogRepository {
  async listGrades(filter: GradeFilter): Promise<GradeSummary[]> {
    const where: Prisma.SteelGradeWhereInput = { isActive: true };
    if (filter.familyCode) where.family = { code: filter.familyCode };
    if (filter.shape) where.variants = { some: { shape: filter.shape, isActive: true } };
    if (filter.q) {
      where.OR = [
        { code: { contains: filter.q, mode: "insensitive" } },
        { name: { contains: filter.q, mode: "insensitive" } },
        { equivalences: { some: { designation: { contains: filter.q, mode: "insensitive" } } } }
      ];
    }
    const grades = await prisma.steelGrade.findMany({
      where,
      include: { family: true, variants: { where: { isActive: true }, select: { shape: true } } },
      orderBy: [{ family: { sortOrder: "asc" } }, { code: "asc" }]
    });
    return grades.map(toSummary);
  }

  async findGradeBySlug(slug: string): Promise<GradeDetail | null> {
    const g = await prisma.steelGrade.findFirst({
      where: { slug, isActive: true },
      include: {
        family: true,
        equivalences: { orderBy: [{ standard: "asc" }, { designation: "asc" }] },
        applications: { include: { application: true } },
        variants: { where: { isActive: true } }
      }
    });
    if (!g) return null;

    const density = Number(g.densityGcm3);
    const variants: VariantView[] = g.variants
      .map((v) => {
        const dimensions = {
          thicknessMm: num(v.thicknessMm),
          widthMm: num(v.widthMm),
          diameterMm: num(v.diameterMm),
          sideMm: num(v.sideMm),
          wallMm: num(v.wallMm)
        };
        const shape = v.shape as ShapeType;
        return {
          id: v.id,
          shape,
          condition: v.condition,
          dimensions,
          stockLengthMm: v.stockLengthMm,
          dimensionLabel: dimensionLabel(shape, dimensions),
          weightPerMeterKg: Number(weightPerMeterKg(shape, dimensions, density).toFixed(3)),
          dataSource: v.dataSource
        };
      })
      .sort((a, b) => a.shape.localeCompare(b.shape) || a.weightPerMeterKg - b.weightPerMeterKg);

    const composition = g.chemicalComposition as GradeDetail["chemicalComposition"];
    return {
      ...toSummary({ ...g, variants: g.variants.map((v) => ({ shape: v.shape })) }),
      hardnessAnnealedHbMax: g.hardnessAnnealedHbMax,
      hardnessWorkingHrc:
        g.hardnessWorkingHrcMin !== null && g.hardnessWorkingHrcMax !== null
          ? { min: g.hardnessWorkingHrcMin, max: g.hardnessWorkingHrcMax }
          : null,
      ratings: { wearResistance: g.wearResistance, toughness: g.toughness, machinability: g.machinability },
      heatTreatmentNotes: g.heatTreatmentNotes,
      chemicalComposition: composition ?? null,
      equivalences: g.equivalences.map((e) => ({ standard: e.standard, designation: e.designation, notes: e.notes })),
      applications: g.applications
        .map((a) => ({ code: a.application.code, name: a.application.name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      variants
    };
  }
}
