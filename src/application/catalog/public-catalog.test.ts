import { describe, expect, it } from "vitest";
import { PublicCatalog, toPublicCard, toPublicSheet } from "./public-catalog";
import type { CatalogRepository, GradeDetail, GradeSummary } from "./ports";

const summary: GradeSummary = {
  code: "D2", slug: "d2", name: "D2", familyCode: "TOOL_COLD", familyName: "Frio", summary: "x",
  densityGcm3: 7.7, dataSource: "EXAMPLE", shapes: ["ROUND_BAR"]
};
const detail: GradeDetail = {
  ...summary,
  hardnessAnnealedHbMax: 255,
  hardnessWorkingHrc: { min: 58, max: 62 },
  ratings: { wearResistance: 5, toughness: 2, machinability: 2 },
  heatTreatmentNotes: "n",
  chemicalComposition: { C: { min: 1.4, max: 1.6 } },
  equivalences: [{ standard: "JIS", designation: "SKD11", notes: null }],
  applications: [{ code: "A", name: "Troqueles" }],
  variants: [{
    id: "SECRET-INTERNAL-ID", shape: "ROUND_BAR", condition: "ANNEALED", dimensions: { diameterMm: 25.4 },
    stockLengthMm: null, dimensionLabel: "Ø 25.4 mm", weightPerMeterKg: 3.9, dataSource: "EXAMPLE"
  }]
};

const repo = (over: Partial<CatalogRepository> = {}): CatalogRepository => ({
  listGrades: async () => [summary],
  findGradeBySlug: async () => detail,
  ...over
});

describe("DTO publico", () => {
  it("la ficha solo expone las llaves de la lista blanca", () => {
    const sheet = toPublicSheet(detail);
    expect(Object.keys(sheet).sort()).toEqual([
      "applications", "code", "composition", "densityGcm3", "equivalences", "family", "hardnessAnnealedHbMax",
      "hardnessWorkingHrc", "heatTreatmentNotes", "isExample", "name", "ratings", "shapes", "sizes", "slug", "summary"
    ]);
    expect(Object.keys(sheet.sizes[0]!).sort()).toEqual(["condition", "label", "shape", "weightPerMeterKg"]);
  });
  it("no filtra ids internos ni dataSource crudo", () => {
    const json = JSON.stringify(toPublicSheet(detail));
    expect(json).not.toContain("SECRET-INTERNAL-ID");
    expect(json).not.toContain("dataSource");
    expect(json).not.toContain("familyCode");
  });
  it("marca isExample y traduce formas", () => {
    expect(toPublicCard(summary)).toMatchObject({ isExample: true, shapes: ["Redondo"] });
    expect(toPublicCard({ ...summary, dataSource: "VERIFIED" }).isExample).toBe(false);
  });
});

describe("PublicCatalog", () => {
  it("descarta filtros invalidos antes de llegar al repositorio", async () => {
    let received: unknown;
    const c = new PublicCatalog(repo({ listGrades: async (f) => ((received = f), []) }));
    await c.list({ shape: "'; DROP TABLE", familyCode: "no valida!", q: "  d2  " });
    expect(received).toEqual({ familyCode: undefined, shape: undefined, q: "d2" });
  });
  it("recorta busquedas largas", async () => {
    let received: { q?: string } = {};
    const c = new PublicCatalog(repo({ listGrades: async (f) => ((received = f), []) }));
    await c.list({ q: "a".repeat(500) });
    expect(received.q).toHaveLength(60);
  });
  it("rechaza slugs raros sin consultar la base", async () => {
    let called = false;
    const c = new PublicCatalog(repo({ findGradeBySlug: async () => ((called = true), detail) }));
    expect(await c.sheet("../etc")).toBeNull();
    expect(await c.sheet("D2")).toBeNull();
    expect(called).toBe(false);
    expect((await c.sheet("d2"))?.code).toBe("D2");
  });
  it("calcula facetas desde los datos", async () => {
    const f = await new PublicCatalog(repo()).facets();
    expect(f.families).toEqual([{ code: "TOOL_COLD", name: "Frio" }]);
    expect(f.shapes).toEqual([{ value: "ROUND_BAR", label: "Redondo" }]);
  });
});
