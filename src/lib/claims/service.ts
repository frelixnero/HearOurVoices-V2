// Claim lifecycle service (spec §13.5). Submission never publishes; publication
// is a separate, permissioned, audited human action (§25.2, §45 rule 5).
import { prisma } from '@/lib/db/client';
import { writeAudit } from '@/lib/audit/audit';
import { decideIntake } from './publishing';
import type { ClaimType, ConfidenceLabel } from '@prisma/client';

export interface SubmitClaimInput {
  submitterUserId: string;
  claimType: ClaimType;
  text: string;
  targetType: string;
  targetId?: string;
  jurisdictionId?: string;
  topic?: string;
  evidenceIds?: string[];
}

export async function submitClaim(input: SubmitClaimInput) {
  const evidenceIds = input.evidenceIds ?? [];
  const intake = decideIntake({
    claimType: input.claimType,
    text: input.text,
    hasEvidence: evidenceIds.length > 0,
  });

  const claim = await prisma.claim.create({
    data: {
      submitterUserId: input.submitterUserId,
      claimType: input.claimType,
      text: input.text,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      jurisdictionId: input.jurisdictionId ?? null,
      topic: input.topic ?? null,
      status: intake.status,
      seriousAllegation: intake.status === 'IN_RESEARCH_REVIEW',
      visibility: 'OWNER_ONLY',
      evidenceLinks: {
        create: evidenceIds.map((evidenceId) => ({ evidenceId, relationship: 'SUPPORTS' as const })),
      },
    },
  });
  await writeAudit({
    actorUserId: input.submitterUserId,
    action: 'claim.submitted',
    entityType: 'claim',
    entityId: claim.id,
    after: { status: claim.status, serious: claim.seriousAllegation },
  });
  return claim;
}

export async function reviewClaim(input: {
  claimId: string;
  reviewerUserId: string;
  reviewType: 'research' | 'legal' | 'safety' | 'duplicate';
  decision: 'approve' | 'reject' | 'needs_evidence' | 'escalate';
  rationale: string;
}) {
  const review = await prisma.claimReview.create({
    data: {
      claimId: input.claimId,
      reviewerUserId: input.reviewerUserId,
      reviewType: input.reviewType,
      decision: input.decision,
      rationale: input.rationale,
    },
  });
  // Move status based on decision, but NEVER to PUBLISHED here (that's publishClaim).
  const nextStatus =
    input.decision === 'reject' ? 'REJECTED'
    : input.decision === 'needs_evidence' ? 'NEEDS_EVIDENCE'
    : input.decision === 'escalate' ? 'IN_LEGAL_REVIEW'
    : 'AWAITING_OFFICIAL_RESPONSE';
  await prisma.claim.update({ where: { id: input.claimId }, data: { status: nextStatus } });
  await writeAudit({
    actorUserId: input.reviewerUserId,
    action: 'claim.reviewed',
    entityType: 'claim',
    entityId: input.claimId,
    after: { decision: input.decision, status: nextStatus },
  });
  return review;
}

/**
 * Publish a reviewed claim. Caller MUST have already passed requirePermission
 * ('claim.publish') — this service records the state change + audit. Requires at
 * least one human review to exist first (§25.2).
 */
export async function publishClaim(input: {
  claimId: string;
  publisherUserId: string;
  confidenceLabel: ConfidenceLabel;
}) {
  const reviews = await prisma.claimReview.count({ where: { claimId: input.claimId } });
  if (reviews === 0) {
    throw new Error('Cannot publish a claim that has not been reviewed by a human (§25.2).');
  }
  const before = await prisma.claim.findUniqueOrThrow({ where: { id: input.claimId } });
  const claim = await prisma.claim.update({
    where: { id: input.claimId },
    data: {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      confidenceLabel: input.confidenceLabel,
      publishedAt: new Date(),
    },
  });
  await writeAudit({
    actorUserId: input.publisherUserId,
    action: 'claim.published',
    entityType: 'claim',
    entityId: claim.id,
    before: { status: before.status, visibility: before.visibility },
    after: { status: claim.status, visibility: claim.visibility, confidence: claim.confidenceLabel },
  });
  return claim;
}
