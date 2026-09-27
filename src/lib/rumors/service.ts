// Rumors service. Submitting runs the same safety screen as stories; voting and
// evidence feed the accuracy grade computed by grading.ts.
import { prisma } from '@/lib/db/client';
import { writeAudit } from '@/lib/audit/audit';
import { screenStory } from '@/lib/stories/safety';
import { gradeRumor, type Grade } from './grading';

export async function submitRumor(input: {
  submitterUserId: string;
  displayName: string;
  anonymous: boolean;
  text: string;
  topic?: string;
}) {
  const screen = screenStory(input.text);
  const held = screen.decision !== 'publish';
  const rumor = await prisma.rumor.create({
    data: {
      submitterUserId: input.submitterUserId,
      displayName: input.anonymous ? 'Anonymous' : input.displayName,
      anonymous: input.anonymous,
      text: input.text,
      topic: input.topic ?? null,
      status: held ? 'PENDING_REVIEW' : 'OPEN',
    },
  });
  await writeAudit({
    actorUserId: input.submitterUserId,
    action: held ? 'rumor.held_for_review' : 'rumor.posted',
    entityType: 'rumor',
    entityId: rumor.id,
  });
  return { rumor, held, reason: screen.reason };
}

export async function listRumors(opts: { topic?: string; cursor?: string | null; take?: number } = {}) {
  const take = Math.min(opts.take ?? 20, 50);
  const rows = await prisma.rumor.findMany({
    where: { status: 'OPEN', ...(opts.topic && opts.topic !== 'all' ? { topic: opts.topic } : {}) },
    orderBy: { createdAt: 'desc' },
    take: take + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
  });
  const hasMore = rows.length > take;
  const items = (hasMore ? rows.slice(0, take) : rows).map(withGrade);
  return { items, nextCursor: hasMore ? (rows[take - 1]?.id ?? null) : null };
}

export async function getRumor(id: string, viewerUserId?: string) {
  const rumor = await prisma.rumor.findFirst({
    where: { id, status: 'OPEN' },
    include: { evidence: { orderBy: { createdAt: 'desc' }, take: 100 } },
  });
  if (!rumor) return null;
  let myVote: string | null = null;
  if (viewerUserId) {
    const v = await prisma.rumorVote.findUnique({ where: { rumorId_userId: { rumorId: id, userId: viewerUserId } } });
    myVote = v?.vote ?? null;
  }
  return { ...withGrade(rumor), evidence: rumor.evidence, myVote };
}

function withGrade<T extends { accurateVotes: number; inaccurateVotes: number; officialGrade: Grade | null }>(r: T) {
  return { ...r, grading: gradeRumor(r) };
}

/** Cast or change a vote; recompute cached tallies. Returns the new grade. */
export async function voteRumor(rumorId: string, userId: string, vote: 'accurate' | 'inaccurate') {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.rumorVote.findUnique({ where: { rumorId_userId: { rumorId, userId } } });
    if (existing?.vote === vote) {
      // Same vote again → retract it.
      await tx.rumorVote.delete({ where: { id: existing.id } });
    } else if (existing) {
      await tx.rumorVote.update({ where: { id: existing.id }, data: { vote } });
    } else {
      await tx.rumorVote.create({ data: { rumorId, userId, vote } });
    }
    const [a, i] = await Promise.all([
      tx.rumorVote.count({ where: { rumorId, vote: 'accurate' } }),
      tx.rumorVote.count({ where: { rumorId, vote: 'inaccurate' } }),
    ]);
    await tx.rumor.update({ where: { id: rumorId }, data: { accurateVotes: a, inaccurateVotes: i } });
  });
  const updated = await prisma.rumor.findUniqueOrThrow({ where: { id: rumorId } });
  const mine = await prisma.rumorVote.findUnique({ where: { rumorId_userId: { rumorId, userId } } });
  return { grading: gradeRumor(updated), myVote: mine?.vote ?? null };
}

export async function addRumorEvidence(input: {
  rumorId: string;
  userId: string;
  displayName: string;
  anonymous: boolean;
  stance: 'supports' | 'refutes';
  note: string;
  url?: string;
}) {
  return prisma.rumorEvidence.create({
    data: {
      rumorId: input.rumorId,
      userId: input.userId,
      displayName: input.anonymous ? 'Anonymous' : input.displayName,
      anonymous: input.anonymous,
      stance: input.stance,
      note: input.note,
      url: input.url ?? null,
    },
  });
}

/** Reviewer verdict — overrides the crowd (requires the caller to be authorized). */
export async function setRumorVerdict(input: {
  rumorId: string;
  reviewerUserId: string;
  grade: Grade;
  rationale: string;
}) {
  const rumor = await prisma.rumor.update({
    where: { id: input.rumorId },
    data: {
      officialGrade: input.grade,
      officialRationale: input.rationale,
      reviewedBy: input.reviewerUserId,
      reviewedAt: new Date(),
    },
  });
  await writeAudit({
    actorUserId: input.reviewerUserId,
    action: 'rumor.verdict_set',
    entityType: 'rumor',
    entityId: input.rumorId,
    after: { grade: input.grade },
  });
  return withGrade(rumor);
}
