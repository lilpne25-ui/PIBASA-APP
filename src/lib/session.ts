import "server-only";
import { cookies } from "next/headers";
import { permissionsForRole, type PermissionKey } from "@/domain/auth/permissions";
import type { SessionClaims } from "@/application/auth/ports";
import { SESSION_MAX_AGE_SECONDS } from "@/infrastructure/auth/hmac-session-codec";
import { getEnv } from "@/infrastructure/config/env";
import { getSessionCodec } from "@/infrastructure/container";

export const AUTH_COOKIE_NAME = "pibasa_session";

export type CurrentSession = SessionClaims & { permissions: PermissionKey[] };

export async function getCurrentSession(): Promise<CurrentSession | null> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  const claims = await getSessionCodec().verify(token);
  return claims ? { ...claims, permissions: permissionsForRole(claims.role) } : null;
}

export async function setSessionCookie(claims: Omit<SessionClaims, "iat" | "exp">) {
  const token = await getSessionCodec().sign(claims);
  (await cookies()).set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: getEnv().AUTH_SECURE_COOKIE === "1",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  });
}

export async function clearSessionCookie() {
  (await cookies()).set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: getEnv().AUTH_SECURE_COOKIE === "1",
    path: "/",
    maxAge: 0
  });
}
