// Moderation service (spec §23). Every action requires a reason; appeals are
// reviewed by someone OTHER than the acting moderator when possible (§23.6).
import { prisma } from '@/lib/db/client';
import { writeAudit } from '@/lib/audit/audit';

// Controlled moderation-reason vocabulary (§23.3).
export const MODERATION_REASONS = [
  'threat', 'harassment', 'doxxing', 'private_information',
  'unsupported_factual_accusation', 'manipulated_evidence', 'spam',
  'impersonation', 'copyright', 'sealed_or_protected_record', 'minor_safety',
  'victim_privacy', 'illegal_content', 'coordinated_manipulation', 'off_topic',
  'duplicate', 'other',
] as const;
export type ModerationReason = (typeof MODERATION_REASONS)[number];

export async function reportContent(input: {
  reporterUserId: string;
  contentType: string;
  contentId: string;
  reason: ModerationReason;
  details?: string;
}) {
  return prisma.contentReport.create({
    data: {
      reporterUserId: input.reporterUserId,
      contentType: input.contentType,
      contentId: input.contentId,
      reason: input.reason,
      details: input.details ?? null,
    },
  });
}

export async function actOnContent(input: {
  moderatorUserId: string;
  contentType: string;
  contentId: string;
  actionType: 'limit' | 'remove' | 'needs_evidence' | 'needs_redaction' | 'legal_hold';
  reason: ModerationReason;
  publicExplanation: string; // required so the notice can be published (§23.4)
  endsAt?: Date;
}) {
  if (!input.publicExplanation.trim()) {
    throw new Error('A moderation action requires a public explanation (§23.4).');
  }
  const action = await prisma.moderationAction.create({
    data: {
      contentType: input.contentType,
      contentId: input.contentId,
      moderatorUserId: input.moderatorUserId,
      actionType: input.actionType,
      reason: input.reason,
      publicExplanation: input.publicExplanation,
      endsAt: input.endsAt ?? null,
    },
  });
  await writeAudit({
    actorUserId: input.moderatorUserId,
    action: `moderation.${input.actionType}`,
    entityType: input.contentType,
    entityId: input.contentId,
    after: { reason: input.reason },
  });
  return action;
}

export async function appealModeration(input: {
  moderationActionId: string;
  appellantUserId: string;
  reason: string;
}) {
  return prisma.moderationAppeal.create({
    data: {
      moderationActionId: input.moderationActionId,
      appellantUserId: input.appellantUserId,
      reason: input.reason,
    },
  });
}

/**
 * Decide an appeal. The reviewer must not be the moderator who took the original
 * action (§23.6). Throws otherwise.
 */
export async function decideAppeal(input: {
  appealId: string;
  reviewerUserId: string;
  decision: 'upheld' | 'reversed';
}) {
  const appeal = await prisma.moderationAppeal.findUniqueOrThrow({
    where: { id: input.appealId },
    include: { moderationAction: true },
  });
  if (appeal.moderationAction.moderatorUserId === input.reviewerUserId) {
    throw new Error('An appeal must be reviewed by someone other than the original moderator (§23.6).');
  }
  const decided = await prisma.moderationAppeal.update({
    where: { id: input.appealId },
    data: {
      status: 'decided',
      reviewedBy: input.reviewerUserId,
      decision: input.decision,
      decidedAt: new Date(),
    },
  });
  await writeAudit({
    actorUserId: input.reviewerUserId,
    action: 'moderation.appeal_decided',
    entityType: 'moderation_appeal',
    entityId: input.appealId,
    after: { decision: input.decision },
  });
  return decided;
}
