// Carga IDEMPOTENTE del catalogo de EJEMPLO. Nunca sobreescribe filas marcadas VERIFIED.
import { PrismaClient } from "@prisma/client";
import { applications, families, grades } from "./seed-data/catalog";
import { dimensionKey, inchToMm, validateDimensions, type Dimensions, type ShapeType, type SurfaceCondition } from "../src/domain/catalog/shapes";

type VariantInput = { shape: ShapeType; condition: SurfaceCondition; dims: Dimensions };

function variantsFor(sizes: (typeof grades)[number]["sizes"]): VariantInput[] {
  const out: VariantInput[] = [];
  if (sizes.rounds) for (const i of sizes.rounds.inches) out.push({ shape: "ROUND_BAR", condition: sizes.rounds.condition, dims: { diameterMm: inchToMm(i) } });
  if (sizes.squares) for (const i of sizes.squares.inches) out.push({ shape: "SQUARE_BAR", condition: sizes.squares.condition, dims: { sideMm: inchToMm(i) } });
  if (sizes.flats) {
    for (const t of sizes.flats.thicknessIn)
      for (const w of sizes.flats.widthIn)
        if (t < w) out.push({ shape: sizes.flats.shape, condition: sizes.flats.condition, dims: { thicknessMm: inchToMm(t), widthMm: inchToMm(w) } });
  }
  return out;
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const familyIds = new Map<string, string>();
    for (const f of families) {
      const row = await prisma.steelFamily.upsert({ where: { code: f.code }, update: { name: f.name, description: f.description, sortOrder: f.sortOrder }, create: { ...f } });
      familyIds.set(f.code, row.id);
    }
    const appIds = new Map<string, string>();
    for (const a of applications) {
      const row = await prisma.usageApplication.upsert({ where: { code: a.code }, update: { name: a.name }, create: { ...a } });
      appIds.set(a.code, row.id);
    }

    let variantCount = 0;
    for (const g of grades) {
      const existing = await prisma.steelGrade.findUnique({ where: { code: g.code }, select: { dataSource: true } });
      if (existing?.dataSource === "VERIFIED") {
        console.log(`Se omite ${g.code}: ya esta VERIFIED`);
        continue;
      }
      const data = {
        name: g.name, summary: g.summary, familyId: familyIds.get(g.family)!, densityGcm3: g.densityGcm3,
        hardnessAnnealedHbMax: g.hbMax, hardnessWorkingHrcMin: g.hrc?.[0] ?? null, hardnessWorkingHrcMax: g.hrc?.[1] ?? null,
        wearResistance: g.wear, toughness: g.tough, machinability: g.mach, heatTreatmentNotes: g.heatTreatment,
        chemicalComposition: g.composition, dataSource: "EXAMPLE" as const
      };
      const grade = await prisma.steelGrade.upsert({ where: { code: g.code }, update: data, create: { code: g.code, slug: g.slug, ...data } });

      for (const e of g.equivalences) {
        await prisma.gradeEquivalence.upsert({
          where: { gradeId_standard_designation: { gradeId: grade.id, standard: e.standard, designation: e.designation } },
          update: { notes: e.notes ?? null }, create: { gradeId: grade.id, standard: e.standard, designation: e.designation, notes: e.notes ?? null }
        });
      }
      for (const code of g.applications) {
        const applicationId = appIds.get(code)!;
        await prisma.gradeApplication.upsert({ where: { gradeId_applicationId: { gradeId: grade.id, applicationId } }, update: {}, create: { gradeId: grade.id, applicationId } });
      }
      for (const v of variantsFor(g.sizes)) {
        const problems = validateDimensions(v.shape, v.dims);
        if (problems.length) throw new Error(`${g.code}: ${problems.join("; ")}`);
        const key = dimensionKey({ gradeCode: g.code, shape: v.shape, condition: v.condition, dims: v.dims });
        const row = {
          shape: v.shape, condition: v.condition, thicknessMm: v.dims.thicknessMm ?? null, widthMm: v.dims.widthMm ?? null,
          diameterMm: v.dims.diameterMm ?? null, sideMm: v.dims.sideMm ?? null, wallMm: v.dims.wallMm ?? null
        };
        await prisma.steelVariant.upsert({ where: { dimensionKey: key }, update: row, create: { gradeId: grade.id, dimensionKey: key, dataSource: "EXAMPLE", ...row } });
        variantCount++;
      }
    }
    console.log(`Catalogo de EJEMPLO cargado: ${grades.length} grados, ${variantCount} medidas, ${applications.length} aplicaciones.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
