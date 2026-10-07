// Prueba de integracion contra PostgreSQL real con el catalogo de ejemplo ya cargado.
// Se omite salvo que RUN_DB_TESTS=1 (CI no levanta base de datos aun).
//   npm run db:seed:catalog && RUN_DB_TESTS=1 npm test
import { afterAll, describe, expect, it } from "vitest";
import { GetGradeDetail, ListGrades } from "@/application/catalog/catalog-queries";
import { PrismaCatalogRepository } from "./prisma-catalog-repository";
import { prisma } from "./prisma-client";

const run = process.env.RUN_DB_TESTS === "1";

describe.skipIf(!run)("PrismaCatalogRepository (DB real)", () => {
  const repo = new PrismaCatalogRepository();
  afterAll(() => prisma.$disconnect());

  it("lista grados con sus formas y marca de dato", async () => {
    const grades = await new ListGrades(repo).execute();
    expect(grades.map((g) => g.code)).toEqual(expect.arrayContaining(["D2", "H13", "M2", "O1", "S1", "W2", "1018", "1020", "1026", "1045"]));
    expect(grades.every((g) => g.dataSource === "EXAMPLE")).toBe(true);
  });

  it("filtra por forma y por equivalencia", async () => {
    const squares = await new ListGrades(repo).execute({ shape: "SQUARE_BAR" });
    expect(squares.map((g) => g.code).sort()).toEqual(["1018", "1020", "1026", "1045"]);
    const byDin = await new ListGrades(repo).execute({ q: "1.2344" });
    expect(byDin.map((g) => g.code)).toEqual(["H13"]);
  });

  it("detalle: equivalencias, aplicaciones, composicion y pesos coherentes", async () => {
    const d2 = await new GetGradeDetail(repo).execute("d2");
    expect(d2).not.toBeNull();
    expect(d2!.equivalences.map((e) => e.designation)).toContain("1.2379");
    expect(d2!.applications.length).toBeGreaterThan(0);
    expect(d2!.chemicalComposition?.Cr).toEqual({ min: 11, max: 13 });
    const round2in = d2!.variants.find((v) => v.shape === "ROUND_BAR" && v.dimensions.diameterMm === 50.8);
    // pi/4 * 50.8^2 mm2 * 1 m * 7.70 g/cm3 ~ 15.60 kg/m
    expect(round2in!.weightPerMeterKg).toBeCloseTo(15.6, 1);
  });

  it("slug invalido o inexistente => null", async () => {
    expect(await new GetGradeDetail(repo).execute("../etc")).toBeNull();
    expect(await new GetGradeDetail(repo).execute("no-existe")).toBeNull();
  });
});
