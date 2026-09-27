// Community Reports service — two lanes (citizen tips & opinions, and independent
// civic journalists), claim-status lifecycle, and corrections. Reuses the safety
// screen (threats/doxxing held) and the neutrality lint (journalist lane).
import { prisma } from '@/lib/db/client';
import { writeAudit } from '@/lib/audit/audit';
import { screenStory } from '@/lib/stories/safety';
import { checkNeutrality } from './neutrality';
import type { PostLabel, ClaimStatus } from './labels';

// ---- Citizen lane -----------------------------------------------------------
export interface CitizenInput {
  authorUserId: string;
  displayName: string;
  anonymous: boolean;
  label: PostLabel;
  title: string;
  body: string;
  topic?: string;
  sourceUrl?: string;
}

export async function submitCitizenReport(input: CitizenInput) {
  const screen = screenStory(`${input.title}\n${input.body}`);
  const held = screen.decision !== 'publish';
  const report = await prisma.communityReport.create({
    data: {
      authorUserId: input.authorUserId,
      lane: 'CITIZEN',
      displayName: input.anonymous ? 'Anonymous' : input.displayName,
      anonymous: input.anonymous,
      label: input.label,
      claimStatus: 'UNREVIEWED', // no instant accuracy grade
      title: input.title,
      body: input.body,
      topic: input.topic ?? null,
      sourceUrl: input.sourceUrl ?? null,
      status: held ? 'PENDING_REVIEW' : 'PUBLISHED',
      publishedAt: held ? null : new Date(),
    },
  });
  await writeAudit({
    actorUserId: input.authorUserId,
    action: held ? 'report.citizen_held' : 'report.citizen_posted',
    entityType: 'community_report', entityId: report.id, after: { label: input.label },
  });
  return { report, held, reason: screen.reason };
}

// ---- Journalist lane --------------------------------------------------------
export interface JournalistInput {
  authorUserId: string;
  byline: string;
  title: string;               // headline
  exactClaim: string;
  videoShows: string;          // "what was actually said/shown"
  videoDoesntProve: string;
  confirmedParts: string;
  origin: string;
  whyImportant: string;
  sourceUrl: string;
  affectedParty: string;
  affectedResponse: string;    // response, or "did not respond"
  conflicts: string;
  neutralityAffirmed: boolean;
}

export async function submitJournalistReport(input: JournalistInput) {
  const screen = screenStory(`${input.title}\n${input.videoShows}\n${input.whyImportant}`);
  const held = screen.decision !== 'publish';
  const neutrality = checkNeutrality(`${input.title}. ${input.videoShows} ${input.confirmedParts}`);
  const report = await prisma.communityReport.create({
    data: {
      authorUserId: input.authorUserId,
      lane: 'JOURNALIST',
      displayName: input.byline,
      anonymous: false, // journalists are accountable
      label: 'EVIDENCE_SUBMITTED',
      claimStatus: 'UNREVIEWED',
      title: input.title,
      body: input.videoShows,
      sourceUrl: input.sourceUrl,
      exactClaim: input.exactClaim,
      videoShows: input.videoShows,
      videoDoesntProve: input.videoDoesntProve,
      confirmedParts: input.confirmedParts,
      origin: input.origin,
      whyImportant: input.whyImportant,
      affectedParty: input.affectedParty,
      affectedResponse: input.affectedResponse,
      conflicts: input.conflicts,
      neutralityFlags: neutrality.flags,
      status: held ? 'PENDING_REVIEW' : 'PUBLISHED',
      publishedAt: held ? null : new Date(),
    },
  });
  await writeAudit({
    actorUserId: input.authorUserId,
    action: held ? 'report.journalist_held' : 'report.journalist_published',
    entityType: 'community_report', entityId: report.id, after: { neutralityFlags: neutrality.flags.length },
  });
  return { report, held, neutrality, reason: screen.reason };
}

// ---- Reads ------------------------------------------------------------------
export async function listReports(opts: { lane?: 'CITIZEN' | 'JOURNALIST'; status?: ClaimStatus; cursor?: string | null; take?: number } = {}) {
  const take = Math.min(opts.take ?? 20, 50);
  const rows = await prisma.communityReport.findMany({
    where: {
      status: 'PUBLISHED',
      ...(opts.lane ? { lane: opts.lane } : {}),
      ...(opts.status ? { claimStatus: opts.status } : {}),
    },
    orderBy: { publishedAt: 'desc' },
    take: take + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
  });
  const hasMore = rows.length > take;
  const items = hasMore ? rows.slice(0, take) : rows;
  return { items, nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null };
}

export async function getReport(id: string) {
  return prisma.communityReport.findFirst({
    where: { id, status: 'PUBLISHED' },
    include: {
      corrections: { orderBy: { createdAt: 'desc' } },
      statusEvents: { orderBy: { createdAt: 'desc' } },
    },
  });
}

// ---- Claim-status lifecycle (reviewer) -------------------------------------
export async function setClaimStatus(input: {
  reportId: string;
  reviewerUserId: string;
  toStatus: ClaimStatus;
  rationale: string;
}) {
  const report = await prisma.communityReport.findUniqueOrThrow({ where: { id: input.reportId } });
  const updated = await prisma.$transaction(async (tx) => {
    await tx.claimStatusEvent.create({
      data: {
        reportId: input.reportId, fromStatus: report.claimStatus, toStatus: input.toStatus,
        rationale: input.rationale, reviewerUserId: input.reviewerUserId,
      },
    });
    return tx.communityReport.update({ where: { id: input.reportId }, data: { claimStatus: input.toStatus } });
  });
  await writeAudit({
    actorUserId: input.reviewerUserId, action: 'report.status_changed',
    entityType: 'community_report', entityId: input.reportId,
    before: { status: report.claimStatus }, after: { status: input.toStatus },
  });
  return updated;
}

export async function issueCorrection(input: {
  reportId: string;
  correctedByUserId: string;
  note: string;
  voluntary?: boolean;
}) {
  const correction = await prisma.communityReportCorrection.create({
    data: {
      reportId: input.reportId, note: input.note,
      correctedBy: input.correctedByUserId, voluntary: input.voluntary ?? true,
    },
  });
  // A visible correction is itself labeled on the post.
  await prisma.communityReport.update({
    where: { id: input.reportId }, data: { label: 'CORRECTION_ISSUED' },
  });
  await writeAudit({
    actorUserId: input.correctedByUserId, action: 'report.correction_issued',
    entityType: 'community_report', entityId: input.reportId,
  });
  return correction;
}
