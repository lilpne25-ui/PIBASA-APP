import { describe, expect, it } from "vitest";
import { weightPerMeterKg } from "@/domain/catalog/shapes";
import { ILLUSTRATIVE_PRICES, formatCents, simulateQuote } from "./quote-sim";

const base = {
  shape: "FLAT_BAR" as const,
  dims: { thicknessMm: 12.7, widthMm: 101.6 },
  densityGcm3: 7.7,
  pieces: 4,
  pieceLengthMm: 300,
  cut: true
};

describe("simulateQuote", () => {
  it("usa el peso teorico real del dominio del catalogo", () => {
    const q = simulateQuote(base);
    expect(q.weightPerMeterKg).toBeCloseTo(weightPerMeterKg("FLAT_BAR", base.dims, 7.7), 6);
    expect(q.totalLengthM).toBeCloseTo(1.2, 6);
    expect(q.totalWeightKg).toBeCloseTo(q.weightPerMeterKg * 1.2, 6);
  });

  it("suma material, corte y flete, y aplica IVA sobre el subtotal (centavos enteros)", () => {
    const q = simulateQuote(base);
    expect(q.cutsCents).toBe(4 * ILLUSTRATIVE_PRICES.cutFeeCents);
    expect(q.subtotalCents).toBe(q.materialCents + q.cutsCents + ILLUSTRATIVE_PRICES.freightCents);
    expect(q.ivaCents).toBe(Math.round(q.subtotalCents * 0.16));
    expect(q.totalCents).toBe(q.subtotalCents + q.ivaCents);
    for (const v of [q.materialCents, q.cutsCents, q.subtotalCents, q.ivaCents, q.totalCents]) {
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it("sin corte no cobra corte", () => {
    expect(simulateQuote({ ...base, cut: false }).cutsCents).toBe(0);
  });

  it("rechaza piezas invalidas y medidas incompletas", () => {
    expect(() => simulateQuote({ ...base, pieces: 0 })).toThrow();
    expect(() => simulateQuote({ ...base, pieces: 1.5 })).toThrow();
    expect(() => simulateQuote({ ...base, dims: { thicknessMm: 12.7 } })).toThrow();
  });

  it("formatea pesos mexicanos", () => {
    expect(formatCents(123456)).toMatch(/1,234\.56/);
  });
});
