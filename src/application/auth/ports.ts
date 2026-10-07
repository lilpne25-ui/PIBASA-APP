import type { AppRole } from "@/domain/auth/permissions";

export type UserRecord = {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  passwordHash: string | null;
  isActive: boolean;
  failedLoginCount: number;
  lockedUntil: Date | null;
};

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  registerFailedLogin(userId: string, lockUntil: Date | null): Promise<void>;
  registerSuccessfulLogin(userId: string, at: Date): Promise<void>;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, storedHash: string): Promise<boolean>;
}

export type AuditEvent = {
  actorId: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

export interface AuditLog {
  record(event: AuditEvent): Promise<void>;
}

export type SessionClaims = {
  sub: string;
  email: string;
  name: string;
  role: AppRole;
  iat: number;
  exp: number;
};

export interface SessionCodec {
  sign(claims: Omit<SessionClaims, "iat" | "exp">, nowMs?: number): Promise<string>;
  verify(token: string, nowMs?: number): Promise<SessionClaims | null>;
}

export interface Clock {
  now(): Date;
}
