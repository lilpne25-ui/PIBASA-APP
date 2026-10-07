import { describe, expect, it } from "vitest";
import { HmacSessionCodec, SESSION_MAX_AGE_SECONDS } from "./hmac-session-codec";

const SECRET = "a".repeat(48);
const claims = { sub: "u1", email: "a@b.mx", name: "Ana", role: "SALES" as const };

describe("HmacSessionCodec", () => {
  it("firma y verifica", async () => {
    const codec = new HmacSessionCodec(SECRET);
    const token = await codec.sign(claims, 1_000_000);
    const out = await codec.verify(token, 1_000_000 + 1000);
    expect(out).toMatchObject({ sub: "u1", role: "SALES" });
  });
  it("rechaza secreto distinto", async () => {
    const token = await new HmacSessionCodec(SECRET).sign(claims);
    expect(await new HmacSessionCodec("b".repeat(48)).verify(token)).toBeNull();
  });
  it("rechaza payload manipulado (escalada de rol)", async () => {
    const codec = new HmacSessionCodec(SECRET);
    const token = await codec.sign(claims);
    const [body, sig] = token.split(".") as [string, string];
    const forged = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    forged.role = "ADMIN";
    const forgedBody = Buffer.from(JSON.stringify(forged)).toString("base64url");
    expect(await codec.verify(`${forgedBody}.${sig}`)).toBeNull();
  });
  it("rechaza token expirado", async () => {
    const codec = new HmacSessionCodec(SECRET);
    const token = await codec.sign(claims, 0);
    expect(await codec.verify(token, (SESSION_MAX_AGE_SECONDS + 1) * 1000)).toBeNull();
  });
  it("rechaza basura y formatos invalidos", async () => {
    const codec = new HmacSessionCodec(SECRET);
    for (const t of ["", "x", "a.b.c", "....", "e30.e30"]) expect(await codec.verify(t)).toBeNull();
  });
  it("exige secreto de al menos 32 caracteres", () => {
    expect(() => new HmacSessionCodec("corto")).toThrow();
  });
});
