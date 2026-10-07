import { describe, expect, it } from "vitest";
import { loadDemoData } from "./load-demo-data";
import type { PublicGradeCard, PublicGradeSheet } from "@/application/catalog/public-catalog";
import { fallbackDemoData } from "./load-demo-data";

const card = (code: string): PublicGradeCard => ({
  code, slug: code.toLowerCase(), name: code, family: "F", summary: "s", shapes: ["Redondo"], isExample: true
});
const sheet = { ...fallbackDemoData().d2 } as PublicGradeSheet;

describe("loadDemoData", () => {
  it("usa el catalogo real, pone D2 primero y limita a 6 tarjetas", async () => {
    const all = ["H13", "M2", "O1", "S1", "W2P", "1018", "D2"].map(card);
    const data = await loadDemoData({ list: async () => all, sheet: async () => sheet });
    expect(data.source).toBe("catalog");
    expect(data.cards[0]!.code).toBe("D2");
    expect(data.cards).toHaveLength(6);
    expect(data.totalGrades).toBe(7);
  });

  it("si el catalogo falla, cae a la muestra local sin romper", async () => {
    const data = await loadDemoData({
      list: async () => {
        throw new Error("db caida");
      },
      sheet: async () => sheet
    });
    expect(data.source).toBe("fallback");
    expect(data.d2.code).toBe("D2");
  });

  it("si no existe D2, tambien usa la muestra local", async () => {
    const data = await loadDemoData({ list: async () => [card("H13")], sheet: async () => null });
    expect(data.source).toBe("fallback");
  });

  it("la muestra local no contiene ids internos ni precios", () => {
    const json = JSON.stringify(fallbackDemoData());
    expect(json).not.toMatch(/price|precio|"id"/i);
  });
});
