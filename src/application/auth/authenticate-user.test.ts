import { beforeEach, describe, expect, it } from "vitest";
import { AuthenticateUser, LOCK_MINUTES, MAX_FAILED_ATTEMPTS } from "./authenticate-user";
import type { AuditEvent, PasswordHasher, UserRecord, UserRepository } from "./ports";

class FakeHasher implements PasswordHasher {
  async hash(p: string) { return `h:${p}`; }
  async verify(p: string, h: string) { return h === `h:${p}`; }
}

class FakeUsers implements UserRepository {
  constructor(public user: UserRecord | null) {}
  async findByEmail(email: string) { return this.user && this.user.email === email ? { ...this.user } : null; }
  async registerFailedLogin(_id: string, lockUntil: Date | null) {
    if (!this.user) return;
    this.user.failedLoginCount = lockUntil ? 0 : this.user.failedLoginCount + 1;
    this.user.lockedUntil = lockUntil;
  }
  async registerSuccessfulLogin() {
    if (!this.user) return;
    this.user.failedLoginCount = 0;
    this.user.lockedUntil = null;
  }
}

const baseUser = (over: Partial<UserRecord> = {}): UserRecord => ({
  id: "u1", email: "ana@pibasa.mx", name: "Ana", role: "SALES",
  passwordHash: "h:correcta-123456", isActive: true, failedLoginCount: 0, lockedUntil: null, ...over
});

let now = new Date("2026-10-07T12:00:00Z");
let events: AuditEvent[];
let users: FakeUsers;
let uc: AuthenticateUser;

function build(user: UserRecord | null) {
  events = [];
  users = new FakeUsers(user);
  uc = new AuthenticateUser(users, new FakeHasher(), { record: async (e) => { events.push(e); } }, { now: () => now });
}

beforeEach(() => { now = new Date("2026-10-07T12:00:00Z"); build(baseUser()); });

describe("AuthenticateUser", () => {
  it("acepta credenciales correctas (correo normalizado) y audita", async () => {
    const r = await uc.execute({ email: "  ANA@pibasa.mx ", password: "correcta-123456" });
    expect(r).toEqual({ ok: true, user: { id: "u1", email: "ana@pibasa.mx", name: "Ana", role: "SALES" } });
    expect(events.map((e) => e.action)).toContain("auth.login");
  });
  it("misma respuesta para usuario inexistente y contrasena mala", async () => {
    const a = await uc.execute({ email: "nadie@x.mx", password: "x" });
    const b = await uc.execute({ email: "ana@pibasa.mx", password: "mala" });
    expect(a).toEqual({ ok: false, reason: "invalid_credentials" });
    expect(b).toEqual({ ok: false, reason: "invalid_credentials" });
  });
  it("rechaza usuario inactivo aunque la contrasena sea correcta", async () => {
    build(baseUser({ isActive: false }));
    expect(await uc.execute({ email: "ana@pibasa.mx", password: "correcta-123456" })).toEqual({ ok: false, reason: "invalid_credentials" });
  });
  it("rechaza usuario sin contrasena asignada", async () => {
    build(baseUser({ passwordHash: null }));
    expect(await uc.execute({ email: "ana@pibasa.mx", password: "lo-que-sea-123" })).toEqual({ ok: false, reason: "invalid_credentials" });
  });
  it("bloquea tras N intentos fallidos y rechaza incluso la contrasena correcta", async () => {
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) await uc.execute({ email: "ana@pibasa.mx", password: "mala" });
    expect(events.map((e) => e.action)).toContain("auth.account_locked");
    expect(await uc.execute({ email: "ana@pibasa.mx", password: "correcta-123456" })).toEqual({ ok: false, reason: "locked" });
  });
  it("el bloqueo expira", async () => {
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) await uc.execute({ email: "ana@pibasa.mx", password: "mala" });
    now = new Date(now.getTime() + (LOCK_MINUTES + 1) * 60_000);
    expect((await uc.execute({ email: "ana@pibasa.mx", password: "correcta-123456" })).ok).toBe(true);
  });
  it("nunca registra la contrasena en auditoria", async () => {
    await uc.execute({ email: "ana@pibasa.mx", password: "secreto-super-123" });
    await uc.execute({ email: "ana@pibasa.mx", password: "secreto-super-124" });
    expect(JSON.stringify(events)).not.toContain("secreto-super");
  });
});
