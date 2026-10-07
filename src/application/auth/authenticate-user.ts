import type { AuditLog, Clock, PasswordHasher, UserRepository } from "./ports";
import type { AppRole } from "@/domain/auth/permissions";

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_MINUTES = 15;

export type AuthenticatedUser = { id: string; email: string; name: string; role: AppRole };

export type AuthenticateResult =
  | { ok: true; user: AuthenticatedUser }
  | { ok: false; reason: "invalid_credentials" | "locked" };

/** Hash con formato valido (contrasena inexistente): iguala tiempos cuando el usuario no existe. */
const DUMMY_HASH =
  "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export class AuthenticateUser {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly audit: AuditLog,
    private readonly clock: Clock
  ) {}

  async execute(input: { email: string; password: string }): Promise<AuthenticateResult> {
    const email = input.email.trim().toLowerCase();
    const now = this.clock.now();
    const user = await this.users.findByEmail(email);

    if (!user) {
      await this.hasher.verify(input.password, DUMMY_HASH);
      await this.audit.record({
        actorId: null,
        action: "auth.login_failed",
        entity: "User",
        metadata: { reason: "unknown_user" }
      });
      return { ok: false, reason: "invalid_credentials" };
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > now.getTime()) {
      await this.audit.record({ actorId: user.id, action: "auth.login_blocked", entity: "User", entityId: user.id });
      return { ok: false, reason: "locked" };
    }

    let passwordOk = false;
    if (user.isActive && user.passwordHash) {
      passwordOk = await this.hasher.verify(input.password, user.passwordHash);
    } else {
      await this.hasher.verify(input.password, DUMMY_HASH);
    }

    if (!passwordOk) {
      const failures = user.failedLoginCount + 1;
      const lockUntil =
        failures >= MAX_FAILED_ATTEMPTS ? new Date(now.getTime() + LOCK_MINUTES * 60_000) : null;
      await this.users.registerFailedLogin(user.id, lockUntil);
      await this.audit.record({
        actorId: user.id,
        action: lockUntil ? "auth.account_locked" : "auth.login_failed",
        entity: "User",
        entityId: user.id,
        metadata: { reason: user.isActive ? "bad_password" : "inactive" }
      });
      return { ok: false, reason: "invalid_credentials" };
    }

    await this.users.registerSuccessfulLogin(user.id, now);
    await this.audit.record({ actorId: user.id, action: "auth.login", entity: "User", entityId: user.id });
    return { ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }
}
