import { describe, expect, it } from "vitest";
import narration from "./narration.json";
import { audioPath, expectedAudioFiles, focusAt, readingMs, scenes, stepAt } from "./scenes";

const words = (s: string) => s.trim().split(/\s+/).length;

describe("escenas de la demo", () => {
  it("hay entre 7 y 10 escenas con ids unicos", () => {
    expect(scenes.length).toBeGreaterThanOrEqual(7);
    expect(scenes.length).toBeLessThanOrEqual(10);
    expect(new Set(scenes.map((s) => s.id)).size).toBe(scenes.length);
  });

  it("cada escena cumple el formato: titulo <= 8 palabras, narracion 35-60 palabras, label NN / VERBO", () => {
    for (const s of scenes) {
      expect(words(s.title), s.id).toBeLessThanOrEqual(8);
      expect(words(s.text), s.id).toBeGreaterThanOrEqual(35);
      expect(words(s.text), s.id).toBeLessThanOrEqual(60);
      expect(s.takeaway.length, s.id).toBeGreaterThan(10);
      if (s.id !== "welcome") expect(s.label, s.id).toMatch(/^\d{2} \/ [A-ZÁÉÍÓÚÑ ]+$/);
    }
  });

  it("narration.json y las escenas coinciden 1 a 1, con las dos voces", () => {
    expect(narration.scenes.map((s) => s.id)).toEqual(scenes.map((s) => s.id));
    for (const s of narration.scenes) expect(s.voice).toEqual(["mujer", "hombre"]);
  });

  it("los beats son crecientes y estan dentro de (0,1)", () => {
    for (const s of scenes) {
      s.beats.forEach((b, i) => {
        expect(b.at, s.id).toBeGreaterThan(0);
        expect(b.at, s.id).toBeLessThan(1);
        if (i > 0) expect(b.at, s.id).toBeGreaterThan(s.beats[i - 1]!.at);
      });
    }
  });

  it("stepAt/focusAt dependen solo del avance (sin estado oculto)", () => {
    const s = scenes.find((x) => x.id === "quote")!;
    expect(stepAt(s, 0)).toBe(0);
    expect(stepAt(s, 0.5)).toBe(3);
    expect(stepAt(s, 1)).toBe(s.beats.length);
    expect(focusAt(s, 0)).toBe(s.target);
    expect(focusAt(s, 5)).toBe("q-total");
  });

  it("la narracion es honesta: marca lo demostrativo como ejemplo/simulacion", () => {
    const all = scenes.map((s) => s.text.toLowerCase()).join(" ");
    expect(all).toContain("simulación");
    expect(all).toContain("ejemplo");
    expect(all).toContain("ilustrativ");
    expect(all).toContain("no una promesa de ahorro");
    expect(all).not.toMatch(/garantiz|aseguramos|ahorrar[áa]n/);
  });

  it("lista de audios esperados: 2 por escena, rutas bajo /demo/narration", () => {
    const files = expectedAudioFiles();
    expect(files).toHaveLength(scenes.length * 2);
    expect(audioPath("quote", "mujer")).toBe("/demo/narration/quote-mujer.mp3");
    expect(files.map((f) => f.file)).toContain("close-hombre.mp3");
  });

  it("el modo lectura da tiempo suficiente", () => {
    for (const s of scenes) expect(readingMs(s)).toBeGreaterThanOrEqual(11_000);
  });
});
