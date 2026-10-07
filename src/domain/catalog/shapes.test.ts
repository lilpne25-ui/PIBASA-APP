import { describe, expect, it } from "vitest";
import {
  crossSectionAreaMm2,
  dimensionKey,
  dimensionLabel,
  inchToMm,
  theoreticalWeightKg,
  validateDimensions,
  weightPerMeterKg
} from "./shapes";

describe("peso teorico", () => {
  it("redondo O50 x 1 m acero al carbono (7.85) ~ 15.41 kg", () => {
    expect(weightPerMeterKg("ROUND_BAR", { diameterMm: 50 }, 7.85)).toBeCloseTo(15.414, 2);
  });
  it("placa 25.4 x 300 x 1000 mm (7.85) ~ 59.82 kg", () => {
    expect(theoreticalWeightKg("PLATE", { thicknessMm: 25.4, widthMm: 300 }, 1000, 7.85)).toBeCloseTo(59.817, 2);
  });
  it("cuadrado 25 x 25 x 1 m (7.85) = 4.906 kg", () => {
    expect(weightPerMeterKg("SQUARE_BAR", { sideMm: 25 }, 7.85)).toBeCloseTo(4.906, 2);
  });
  it("tubo O60 x 5 x 1 m (7.85) ~ 6.78 kg/m", () => {
    expect(weightPerMeterKg("TUBE", { diameterMm: 60, wallMm: 5 }, 7.85)).toBeCloseTo(6.78, 1);
  });
  it("el peso escala linealmente con el largo y con la densidad", () => {
    const a = theoreticalWeightKg("ROUND_BAR", { diameterMm: 30 }, 500, 7.7);
    expect(theoreticalWeightKg("ROUND_BAR", { diameterMm: 30 }, 1000, 7.7)).toBeCloseTo(a * 2, 6);
    expect(theoreticalWeightKg("ROUND_BAR", { diameterMm: 30 }, 500, 7.7 * 2)).toBeCloseTo(a * 2, 6);
  });
  it("rechaza entradas invalidas", () => {
    expect(() => theoreticalWeightKg("ROUND_BAR", { diameterMm: 30 }, 0, 7.85)).toThrow();
    expect(() => theoreticalWeightKg("ROUND_BAR", { diameterMm: 30 }, 100, 0)).toThrow();
    expect(() => crossSectionAreaMm2("ROUND_BAR", {})).toThrow();
  });
});

describe("validacion de dimensiones", () => {
  it("exige las dimensiones propias de cada forma", () => {
    expect(validateDimensions("PLATE", { thicknessMm: 10, widthMm: 100 })).toEqual([]);
    expect(validateDimensions("PLATE", { thicknessMm: 10 })).not.toEqual([]);
    expect(validateDimensions("ROUND_BAR", { diameterMm: 20 })).toEqual([]);
    expect(validateDimensions("TUBE", { diameterMm: 20, wallMm: 2 })).toEqual([]);
  });
  it("rechaza dimensiones que no aplican, negativas, NaN o pared imposible", () => {
    expect(validateDimensions("ROUND_BAR", { diameterMm: 20, widthMm: 5 })).not.toEqual([]);
    expect(validateDimensions("ROUND_BAR", { diameterMm: -1 })).not.toEqual([]);
    expect(validateDimensions("ROUND_BAR", { diameterMm: Number.NaN })).not.toEqual([]);
    expect(validateDimensions("TUBE", { diameterMm: 10, wallMm: 5 })).not.toEqual([]);
  });
});

describe("dimensionKey / etiquetas", () => {
  const base = { gradeCode: "d2", shape: "ROUND_BAR" as const, condition: "ANNEALED" as const };
  it("es determinista y normaliza el codigo", () => {
    const a = dimensionKey({ ...base, dims: { diameterMm: 25.4 } });
    expect(a).toBe(dimensionKey({ ...base, gradeCode: "D2", dims: { diameterMm: 25.4 } }));
    expect(a).toContain("D2|ROUND_BAR|ANNEALED");
  });
  it("distingue medidas, condiciones y largos", () => {
    const k = (over: object) => dimensionKey({ ...base, dims: { diameterMm: 25.4 }, ...over });
    expect(k({})).not.toBe(k({ dims: { diameterMm: 25.5 } }));
    expect(k({})).not.toBe(k({ condition: "GROUND" }));
    expect(k({})).not.toBe(k({ stockLengthMm: 3000 }));
  });
  it("convierte pulgadas y etiqueta", () => {
    expect(inchToMm(0.5)).toBe(12.7);
    expect(inchToMm(1 / 4)).toBe(6.35);
    expect(dimensionLabel("ROUND_BAR", { diameterMm: 50.8 })).toBe("Ø 50.8 mm");
    expect(dimensionLabel("PLATE", { thicknessMm: 12.7, widthMm: 152.4 })).toBe("12.7 x 152.4 mm");
  });
});
