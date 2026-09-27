// Justice Vault service. Cases are created by staff (moderated). Read is public.
import { prisma } from '@/lib/db/client';
import { writeAudit } from '@/lib/audit/audit';
import { suggestSpotlight } from './labels';
import type { CaseStatus, TimelineEvent, AuthorityAction, OpenQuestion, ContradictionFlag, CaseSource } from './labels';

export interface CreateCaseInput {
  createdBy: string;
  victimName: string;
  victimAge?: number;
  location?: string;
  dateOfIncident?: string;
  caseType: string;
  memoryLockPrimary: string;
  memoryLockFailure: string;
  status?: CaseStatus;
  justiceGapScore: number;
  favoriteActivities?: string;
  personalityWords: string[];
  whatWasLost?: string;
  anchorPhrases: string[];
  timeline: TimelineEvent[];
  actions: AuthorityAction[];
  questions: OpenQuestion[];
  flags: ContradictionFlag[];
  sources: CaseSource[];
}

function parseDate(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createCase(input: CreateCaseInput) {
  const spotlightLevel = suggestSpotlight({
    justiceGapScore: input.justiceGapScore,
    flagCount: input.flags.length,
    openQuestionCount: input.questions.filter((q) => q.status !== 'Addressed').length,
  });
  const c = await prisma.justiceCase.create({
    data: {
      createdBy: input.createdBy,
      victimName: input.victimName,
      victimAge: input.victimAge ?? null,
      location: input.location ?? null,
      dateOfIncident: parseDate(input.dateOfIncident),
      caseType: input.caseType,
      memoryLockPrimary: input.memoryLockPrimary,
      memoryLockFailure: input.memoryLockFailure,
      status: input.status ?? 'ACTIVE',
      justiceGapScore: Math.max(0, Math.min(100, input.justiceGapScore)),
      spotlightLevel,
      favoriteActivities: input.favoriteActivities ?? null,
      personalityWords: input.personalityWords,
      whatWasLost: input.whatWasLost ?? null,
      anchorPhrases: input.anchorPhrases,
      timeline: input.timeline as never,
      actions: input.actions as never,
      questions: input.questions as never,
      flags: input.flags as never,
      sources: input.sources as never,
      publishState: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });
  await writeAudit({ actorUserId: input.createdBy, action: 'vault.case_published', entityType: 'justice_case', entityId: c.id, after: { spotlightLevel } });
  return c;
}

export async function listCases(opts: { take?: number } = {}) {
  return prisma.justiceCase.findMany({
    where: { publishState: 'PUBLISHED' },
    orderBy: [{ spotlightLevel: 'desc' }, { justiceGapScore: 'desc' }, { createdAt: 'desc' }],
    take: Math.min(opts.take ?? 50, 100),
  });
}

export async function getCase(id: string, opts: { includeUnpublished?: boolean } = {}) {
  return prisma.justiceCase.findFirst({
    where: opts.includeUnpublished ? { id } : { id, publishState: 'PUBLISHED' },
  });
}

/** One spotlight case to feature (highest level, highest gap). */
export async function featuredCase() {
  return prisma.justiceCase.findFirst({
    where: { publishState: 'PUBLISHED', spotlightLevel: { gte: 2 } },
    orderBy: [{ spotlightLevel: 'desc' }, { justiceGapScore: 'desc' }],
  });
}
