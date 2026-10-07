import { describe, expect, it } from "vitest";
import { ScryptPasswordHasher } from "./scrypt-password-hasher";

describe("ScryptPasswordHasher", () => {
  const hasher = new ScryptPasswordHasher();

  it("hashea y verifica; hashes distintos por salt", async () => {
    const a = await hasher.hash("contrasena-segura-1");
    const b = await hasher.hash("contrasena-segura-1");
    expect(a).not.toBe(b);
    expect(await hasher.verify("contrasena-segura-1", a)).toBe(true);
    expect(await hasher.verify("otra-contrasena-1", a)).toBe(false);
  });
  it("rechaza contrasenas cortas", async () => {
    await expect(hasher.hash("corta")).rejects.toThrow();
  });
  it("no lanza con hashes malformados", async () => {
    for (const h of ["", "x", "bcrypt$1$2$3$a$b", "scrypt$a$b$c$d$e"]) {
      expect(await hasher.verify("lo-que-sea", h)).toBe(false);
    }
  });
});
