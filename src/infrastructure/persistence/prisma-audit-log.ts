import type { Prisma } from "@prisma/client";
import type { AuditEvent, AuditLog } from "@/application/auth/ports";
import { prisma } from "./prisma-client";

export class PrismaAuditLog implements AuditLog {
  async record(event: AuditEvent): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          actorId: event.actorId,
          action: event.action,
          entity: event.entity,
          entityId: event.entityId ?? null,
          metadata: (event.metadata ?? {}) as Prisma.InputJsonValue
        }
      });
    } catch (error) {
      // La auditoria no debe tumbar el flujo principal, pero tampoco se silencia.
      console.error("audit_log_write_failed", error instanceof Error ? error.message : "unknown");
    }
  }
}
