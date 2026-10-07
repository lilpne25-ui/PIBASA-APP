import { describe, expect, it } from "vitest";
import { FixedWindowRateLimiter } from "./rate-limiter";

describe("FixedWindowRateLimiter", () => {
  it("permite hasta el limite y bloquea despues con retryAfter", () => {
    const l = new FixedWindowRateLimiter(3, 60_000);
    expect([1, 2, 3].map(() => l.check("ip", 0).allowed)).toEqual([true, true, true]);
    const d = l.check("ip", 10_000);
    expect(d.allowed).toBe(false);
    expect(d.retryAfterSeconds).toBe(50);
  });
  it("aisla claves y reinicia la ventana", () => {
    const l = new FixedWindowRateLimiter(1, 1000);
    expect(l.check("a", 0).allowed).toBe(true);
    expect(l.check("a", 1).allowed).toBe(false);
    expect(l.check("b", 1).allowed).toBe(true);
    expect(l.check("a", 1001).allowed).toBe(true);
  });
  it("no crece sin limite", () => {
    const l = new FixedWindowRateLimiter(5, 1_000_000, 100);
    for (let i = 0; i < 1000; i++) l.check(`k${i}`, i);
    // @ts-expect-error acceso interno para verificar la cota
    expect(l.hits.size).toBeLessThanOrEqual(100);
  });
});
