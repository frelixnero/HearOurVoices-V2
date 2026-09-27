// Public-records request service (spec §15). Tracks a request through its
// lifecycle with an event log; productions link to stored evidence.
import { prisma } from '@/lib/db/client';
import { writeAudit } from '@/lib/audit/audit';
import type { RecordsRequestStatus } from '@prisma/client';

export async function createRecordsRequest(input: {
  creatorUserId: string;
  agencyId?: string;
  jurisdictionId?: string;
  title: string;
  requestText: string;
  feeLimitCents?: number;
  public?: boolean;
}) {
  const req = await prisma.recordsRequest.create({
    data: {
      creatorUserId: input.creatorUserId,
      agencyId: input.agencyId ?? null,
      jurisdictionId: input.jurisdictionId ?? null,
      title: input.title,
      requestText: input.requestText,
      feeLimit: input.feeLimitCents != null ? input.feeLimitCents / 100 : null,
      public: input.public ?? false,
      status: 'DRAFT',
      events: { create: { eventType: 'created', createdBy: input.creatorUserId } },
    },
  });
  await writeAudit({
    actorUserId: input.creatorUserId,
    action: 'records_request.created',
    entityType: 'records_request',
    entityId: req.id,
  });
  return req;
}

export async function advanceRequest(input: {
  requestId: string;
  actorUserId: string;
  status: RecordsRequestStatus;
  description?: string;
}) {
  const updated = await prisma.recordsRequest.update({
    where: { id: input.requestId },
    data: {
      status: input.status,
      ...(input.status === 'SENT' ? { sentAt: new Date() } : {}),
      events: {
        create: {
          eventType: `status:${input.status}`,
          description: input.description ?? null,
          createdBy: input.actorUserId,
        },
      },
    },
  });
  return updated;
}

/** Endorse a public request (verified citizens); one endorsement per user. */
export async function endorseRequest(input: { requestId: string; userId: string }) {
  // Reuse Follow as the endorsement signal (targetType 'records_request').
  return prisma.follow.upsert({
    where: {
      userId_targetType_targetId: {
        userId: input.userId,
        targetType: 'records_request',
        targetId: input.requestId,
      },
    },
    update: {},
    create: { userId: input.userId, targetType: 'records_request', targetId: input.requestId },
  });
}
