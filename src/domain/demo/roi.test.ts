import { describe, expect, it } from "vitest";
import { ROI_EMPTY, ROI_ILLUSTRATIVE_DEFAULTS, calculateRoi } from "./roi";

describe("calculateRoi", () => {
  it("calcula tiempo y recuperacion con supuestos visibles", () => {
    const r = calculateRoi(ROI_ILLUSTRATIVE_DEFAULTS);
    expect(r.hoursSavedPerMonth).toBeCloseTo((120 * 12) / 60, 6); // 24 h
    expect(r.timeValueMxn).toBeCloseTo(24 * 120, 6);
    expect(r.recoveredQuotesPerMonth).toBeCloseTo(3, 6);
    expect(r.recoveredMarginMxn).toBeCloseTo(4500, 6);
    expect(r.monthlyTotalMxn).toBeCloseTo(24 * 120 + 4500, 6);
    expect(r.paybackMonths).toBeNull();
  });

  it("todo en cero da cero, sin NaN", () => {
    const r = calculateRoi(ROI_EMPTY);
    expect(Object.values(r).every((v) => v === 0 || v === null)).toBe(true);
  });

  it("no genera ahorro negativo si el sistema fuera mas lento", () => {
    const r = calculateRoi({ ...ROI_ILLUSTRATIVE_DEFAULTS, minutesToday: 5, minutesWithSystem: 10 });
    expect(r.hoursSavedPerMonth).toBe(0);
  });

  it("sanea entradas invalidas y topa el porcentaje en 100", () => {
    const r = calculateRoi({ ...ROI_ILLUSTRATIVE_DEFAULTS, quotesPerMonth: NaN, recoveryRatePct: 900, hourlyCostMxn: -5 });
    expect(r.hoursSavedPerMonth).toBe(0);
    expect(r.recoveredQuotesPerMonth).toBeCloseTo(12, 6);
    expect(r.timeValueMxn).toBe(0);
  });

  it("calcula plazo de recuperacion solo si hay inversion y beneficio", () => {
    const r = calculateRoi({ ...ROI_ILLUSTRATIVE_DEFAULTS, investmentMxn: 73_800 });
    expect(r.paybackMonths).toBeCloseTo(73_800 / r.monthlyTotalMxn, 6);
    expect(calculateRoi({ ...ROI_EMPTY, investmentMxn: 1000 }).paybackMonths).toBeNull();
  });
});
