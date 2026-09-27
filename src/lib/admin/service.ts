// Admin/moderation backend for the story platform. All callers must already be
// gated by requireModerator()/requireAdmin(); these functions do the work + audit.
import { prisma } from '@/lib/db/client';
import { writeAudit } from '@/lib/audit/audit';

export async function adminOverview() {
  const [users, admins, journalists, stories, storiesHeld, reports, reportsHeld, casesHeld, newsHeld] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isAdmin: true } }),
    prisma.user.count({ where: { isJournalist: true } }),
    prisma.story.count({ where: { status: 'PUBLISHED' } }),
    prisma.story.count({ where: { status: 'PENDING_REVIEW' } }),
    prisma.communityReport.count({ where: { status: 'PUBLISHED' } }),
    prisma.communityReport.count({ where: { status: 'PENDING_REVIEW' } }),
    prisma.justiceCase.count({ where: { publishState: 'PENDING_REVIEW' } }),
    prisma.civicNews.count({ where: { status: 'PENDING_REVIEW' } }),
  ]);
  const tributesHeld = await prisma.honorTribute.count({ where: { status: 'PENDING_REVIEW' } });
  return { users, admins, journalists, stories, storiesHeld, reports, reportsHeld, casesHeld, newsHeld, tributesHeld };
}

/** Everything waiting for a human: held stories, community reports, Vault cases, and civic news. */
export async function reviewQueue() {
  const [stories, reports, cases, news] = await Promise.all([
    prisma.story.findMany({ where: { status: 'PENDING_REVIEW' }, orderBy: { createdAt: 'asc' }, take: 100 }),
    prisma.communityReport.findMany({ where: { status: 'PENDING_REVIEW' }, orderBy: { createdAt: 'asc' }, take: 100 }),
    prisma.justiceCase.findMany({
      where: { publishState: 'PENDING_REVIEW' }, orderBy: { createdAt: 'asc' }, take: 100,
      select: { id: true, victimName: true, caseType: true, location: true, memoryLockPrimary: true, memoryLockFailure: true, justiceGapScore: true, spotlightLevel: true },
    }),
    prisma.civicNews.findMany({
      where: { status: 'PENDING_REVIEW' }, orderBy: { createdAt: 'asc' }, take: 100,
      select: { id: true, title: true, scope: true, authority: true, actorType: true, jurisdiction: true, whatHappened: true },
    }),
  ]);
  const tributes = await prisma.honorTribute.findMany({
    where: { status: 'PENDING_REVIEW' }, orderBy: { createdAt: 'asc' }, take: 100,
    select: { id: true, displayName: true, relationship: true, message: true, hero: { select: { heroName: true, rank: true } } },
  });
  return { stories, reports, cases, news, tributes };
}

export async function moderateTribute(id: string, action: ModAction, moderatorUserId: string) {
  const t = await prisma.honorTribute.update({
    where: { id },
    data: action === 'approve' ? { status: 'PUBLISHED', publishedAt: new Date() } : { status: 'REMOVED' },
  });
  await writeAudit({ actorUserId: moderatorUserId, action: `admin.honor_tribute_${action}`, entityType: 'honor_tribute', entityId: id });
  return t;
}

type ModAction = 'approve' | 'remove';

export async function moderateStory(id: string, action: ModAction, moderatorUserId: string) {
  const story = await prisma.story.update({
    where: { id },
    data: action === 'approve'
      ? { status: 'PUBLISHED', publishedAt: new Date() }
      : { status: 'REMOVED' },
  });
  await writeAudit({ actorUserId: moderatorUserId, action: `admin.story_${action}`, entityType: 'story', entityId: id });
  return story;
}

export async function moderateReport(id: string, action: ModAction, moderatorUserId: string) {
  const report = await prisma.communityReport.update({
    where: { id },
    data: action === 'approve'
      ? { status: 'PUBLISHED', publishedAt: new Date() }
      : { status: 'REMOVED' },
  });
  await writeAudit({ actorUserId: moderatorUserId, action: `admin.report_${action}`, entityType: 'community_report', entityId: id });
  return report;
}

export async function moderateCase(id: string, action: ModAction, moderatorUserId: string) {
  const c = await prisma.justiceCase.update({
    where: { id },
    data: action === 'approve'
      ? { publishState: 'PUBLISHED', publishedAt: new Date() }
      : { publishState: 'REMOVED' },
  });
  await writeAudit({ actorUserId: moderatorUserId, action: `admin.vault_case_${action}`, entityType: 'justice_case', entityId: id });
  return c;
}

export async function moderateNews(id: string, action: ModAction, moderatorUserId: string) {
  const n = await prisma.civicNews.update({
    where: { id },
    data: action === 'approve'
      ? { status: 'PUBLISHED', publishedAt: new Date() }
      : { status: 'REMOVED' },
  });
  await writeAudit({ actorUserId: moderatorUserId, action: `admin.civic_news_${action}`, entityType: 'civic_news', entityId: id });
  return n;
}

export async function listUsers(q?: string) {
  return prisma.user.findMany({
    where: q ? { OR: [{ email: { contains: q, mode: 'insensitive' } }, { displayName: { contains: q, mode: 'insensitive' } }] } : {},
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true, email: true, displayName: true, status: true, createdAt: true,
      isJournalist: true, isModerator: true, isAdmin: true,
    },
  });
}

export type Capability = 'isJournalist' | 'isModerator' | 'isAdmin' | 'suspended';

/** Grant/revoke a capability, or suspend/reactivate. Admin-only (enforced upstream). */
export async function setUserCapability(input: {
  targetUserId: string;
  capability: Capability;
  value: boolean;
  actorUserId: string;
}) {
  const data =
    input.capability === 'suspended'
      ? { status: input.value ? 'SUSPENDED' as const : 'ACTIVE' as const }
      : { [input.capability]: input.value };
  const user = await prisma.user.update({ where: { id: input.targetUserId }, data });
  await writeAudit({
    actorUserId: input.actorUserId,
    action: `admin.user_${input.capability}_${input.value ? 'grant' : 'revoke'}`,
    entityType: 'user', entityId: input.targetUserId,
  });
  return { id: user.id, status: user.status, isJournalist: user.isJournalist, isModerator: user.isModerator, isAdmin: user.isAdmin };
}
