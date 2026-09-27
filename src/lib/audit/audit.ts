// Append-only audit logging (spec §28.11, §4.6, §45 rules 14 & 18).
// This module only ever INSERTS. There is deliberately no update/delete helper —
// audit history must not be silently rewritten.
import { prisma } from '@/lib/db/client';

export interface AuditParams {
  actorUserId?: string | null;
  action: string; // e.g. "claim.publish", "user.role_granted"
  entityType: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
  ipHash?: string | null;
}

export async function writeAudit(params: AuditParams): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorUserId: params.actorUserId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      beforeJson: (params.before ?? null) as never,
      afterJson: (params.after ?? null) as never,
      ipHash: params.ipHash ?? null,
    },
  });
}
