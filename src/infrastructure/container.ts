import "server-only";
import { AuthenticateUser } from "@/application/auth/authenticate-user";
import { HmacSessionCodec } from "@/infrastructure/auth/hmac-session-codec";
import { ScryptPasswordHasher } from "@/infrastructure/auth/scrypt-password-hasher";
import { getEnv } from "@/infrastructure/config/env";
import { PrismaAuditLog } from "@/infrastructure/persistence/prisma-audit-log";
import { PrismaUserRepository } from "@/infrastructure/persistence/prisma-user-repository";

/** Raiz de composicion: unico lugar donde los puertos se enlazan con sus adaptadores. */
export function getSessionCodec() {
  return new HmacSessionCodec(getEnv().AUTH_SECRET);
}

export function getAuthenticateUser() {
  return new AuthenticateUser(
    new PrismaUserRepository(),
    new ScryptPasswordHasher(),
    new PrismaAuditLog(),
    { now: () => new Date() }
  );
}
