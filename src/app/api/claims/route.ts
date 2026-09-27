import { prisma } from '@/lib/db/client';
import { handle, clientIp } from '@/lib/http/route';
import { hashIp } from '@/lib/auth/crypto';
import { requirePermission } from '@/lib/permissions/guard';
import { submitClaimSchema } from '@/lib/validation/claims';
import { decideIntake } from '@/lib/claims/publishing';
import { rateLimit } from '@/lib/http/rate-limit';
import { writeAudit } from '@/lib/audit/audit';
import { ok } from '@/lib/http/responses';

// Submit a claim (Verified Citizen+). Never publishes automatically (§45 rule 5):
// intake routes serious allegations to human review and evidence-less claims to
// NEEDS_EVIDENCE. Publication is a separate permissioned action.
export const POST = handle(async (req) => {
  const ip = clientIp(req);
  const user = await requirePermission('claim.submit', { entityType: 'claim', ipHash: hashIp(ip) });

  const rl = rateLimit(`claim:${user.id}`, { limit: 20, windowMs: 60_000 });
  if (!rl.allowed) {
    return ok({ queued: false, message: 'Rate limit reached.' }, { status: 429 });
  }

  const body = submitClaimSchema.parse(await req.json());

  // Duplicate-submission protection (§45 rule 19): same user + idempotency key.
  if (body.idempotencyKey) {
    const dupe = await prisma.claim.findFirst({
      where: { submitterUserId: user.id, topic: body.topic ?? undefined, text: body.text },
      select: { id: true, status: true },
    });
    if (dupe) return ok({ claimId: dupe.id, status: dupe.status, duplicate: true });
  }

  const intake = decideIntake({
    claimType: body.claimType,
    text: body.text,
    hasEvidence: body.evidenceIds.length > 0,
  });

  const claim = await prisma.claim.create({
    data: {
      submitterUserId: user.id,
      claimType: body.claimType,
      text: body.text,
      targetType: body.targetType,
      targetId: body.targetId ?? null,
      jurisdictionId: body.jurisdictionId ?? null,
      topic: body.topic ?? null,
      occurredAt: body.occurredAt ? new Date(body.occurredAt) : null,
      status: intake.status,
      seriousAllegation: intake.status === 'IN_RESEARCH_REVIEW',
      visibility: 'OWNER_ONLY', // nothing is public until a reviewer publishes it
      evidenceLinks: {
        create: body.evidenceIds.map((evidenceId) => ({
          evidenceId,
          relationship: 'SUPPORTS' as const,
        })),
      },
    },
  });

  await writeAudit({
    actorUserId: user.id,
    action: 'claim.submitted',
    entityType: 'claim',
    entityId: claim.id,
    after: { status: intake.status, serious: claim.seriousAllegation },
    ipHash: hashIp(ip),
  });

  return ok(
    { claimId: claim.id, status: claim.status, message: intake.reason },
    { status: 201 },
  );
});
