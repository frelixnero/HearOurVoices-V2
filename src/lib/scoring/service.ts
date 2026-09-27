// Scorecard build/publish service (spec §10). Persists the computed result with
// its methodology, confidence, and insufficient-data flag. Missing data is never
// scored as zero — categories without data are stored with score=null (§10.5).
import { prisma } from '@/lib/db/client';
import { writeAudit } from '@/lib/audit/audit';
import { computeScore, type CategoryInput } from './score';

export async function buildScorecard(input: {
  entityType: string;
  entityId: string;
  methodologyId: string;
  periodStart: Date;
  periodEnd: Date;
  categories: CategoryInput[];
}) {
  const result = computeScore(input.categories);

  const scorecard = await prisma.scorecard.create({
    data: {
      entityType: input.entityType,
      entityId: input.entityId,
      methodologyId: input.methodologyId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      overallScore: result.overallScore, // null when insufficient (NOT zero)
      confidence: result.insufficientData ? 'insufficient_data' : 'scored',
      insufficientData: result.insufficientData,
      categories: {
        create: result.categories.map((c) => ({
          categoryName: c.name,
          score: c.score,
          weight: c.weight,
          confidence: c.confidence,
        })),
      },
    },
  });
  return { scorecard, result };
}

export async function publishScorecard(input: { scorecardId: string; publisherUserId: string }) {
  const sc = await prisma.scorecard.update({
    where: { id: input.scorecardId },
    data: { publishedAt: new Date() },
  });
  await writeAudit({
    actorUserId: input.publisherUserId,
    action: 'scorecard.published',
    entityType: 'scorecard',
    entityId: sc.id,
    after: { insufficientData: sc.insufficientData },
  });
  return sc;
}

export async function appealScorecard(input: {
  scorecardId: string;
  appellantUserId: string;
  reason: string;
  evidenceId?: string;
}) {
  return prisma.scorecardAppeal.create({
    data: {
      scorecardId: input.scorecardId,
      appellantUserId: input.appellantUserId,
      reason: input.reason,
      evidenceId: input.evidenceId ?? null,
    },
  });
}
