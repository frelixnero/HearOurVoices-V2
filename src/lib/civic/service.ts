// Civic News service. Creating an item is a staff/journalist action (moderated for
// legal safety); voting the public judgment is open to any signed-in user.
import { prisma } from '@/lib/db/client';
import { writeAudit } from '@/lib/audit/audit';
import { sendPushToAll } from '@/lib/push/service';
import { judge, detectRedFlags } from './labels';
import type { CivicScope, CivicVerdict, EvidenceLabel, AuthorityCategory } from './labels';

/** Normalize an actor into a stable key for history/pattern tracking. */
export function actorKeyOf(actorName?: string | null, actorType?: string | null): string | null {
  const base = (actorName || actorType || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return base || null;
}

export interface CreateNewsInput {
  createdBy: string;
  scope: CivicScope;
  authority: AuthorityCategory;
  title: string;
  actorType: string;
  actorName?: string;
  actionType?: string;
  jurisdiction?: string;
  whatHappened: string;
  whyItMatters: string;
  nextStep?: string;
  pros: string[];
  cons: string[];
  alternatives: string[];
  powerMap: string[];
  process: Partial<Record<'recordedVote' | 'publicNotice' | 'amendmentPosted' | 'meetingRecorded' | 'publicComment' | 'procedureLegal', boolean | null>>;
  impactLevel: number;
  sources: { label: EvidenceLabel; title: string; url?: string }[];
}

export async function createNews(input: CreateNewsInput) {
  const news = await prisma.civicNews.create({
    data: {
      createdBy: input.createdBy,
      scope: input.scope,
      authority: input.authority,
      title: input.title,
      actorType: input.actorType,
      actorName: input.actorName ?? null,
      actorKey: actorKeyOf(input.actorName, input.actorType),
      actionType: input.actionType ?? null,
      jurisdiction: input.jurisdiction ?? null,
      whatHappened: input.whatHappened,
      whyItMatters: input.whyItMatters,
      nextStep: input.nextStep ?? null,
      pros: input.pros,
      cons: input.cons,
      alternatives: input.alternatives,
      powerMap: input.powerMap,
      recordedVote: input.process.recordedVote ?? null,
      publicNotice: input.process.publicNotice ?? null,
      amendmentPosted: input.process.amendmentPosted ?? null,
      meetingRecorded: input.process.meetingRecorded ?? null,
      publicComment: input.process.publicComment ?? null,
      procedureLegal: input.process.procedureLegal ?? null,
      impactLevel: Math.max(0, Math.min(5, input.impactLevel)),
      status: 'PUBLISHED',
      publishedAt: new Date(),
      sources: { create: input.sources.map((s) => ({ label: s.label, title: s.title, url: s.url ?? null })) },
    },
  });
  await writeAudit({ actorUserId: input.createdBy, action: 'civic.news_published', entityType: 'civic_news', entityId: news.id, after: { scope: input.scope } });

  // Alert opted-in devices when a red flag or high-impact action publishes.
  const flags = detectRedFlags(news as unknown as Record<string, boolean | null>);
  if (flags.length > 0 || news.impactLevel >= 4) {
    const title = flags.length > 0 ? `🚩 ${flags.length} red flag${flags.length === 1 ? '' : 's'} in the record` : '📣 Breaking civic news';
    void sendPushToAll({ title, body: news.title, url: `/news/${news.id}`, tag: `news-${news.id}` }).catch(() => {});
  }
  return news;
}

export async function listNews(opts: { scope?: CivicScope; cursor?: string | null; take?: number } = {}) {
  const take = Math.min(opts.take ?? 20, 50);
  const rows = await prisma.civicNews.findMany({
    where: { status: 'PUBLISHED', ...(opts.scope ? { scope: opts.scope } : {}) },
    orderBy: { publishedAt: 'desc' },
    take: take + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
  });
  const hasMore = rows.length > take;
  const items = (hasMore ? rows.slice(0, take) : rows).map((n) => ({ ...n, judgment: judge(n.goodVotes, n.badVotes, n.infoVotes) }));
  return { items, nextCursor: hasMore ? (rows[take - 1]?.id ?? null) : null };
}

/** Published civic news whose jurisdiction mentions a state (for state landing pages). */
export async function newsForState(stateName: string, take = 12) {
  const rows = await prisma.civicNews.findMany({
    where: { status: 'PUBLISHED', jurisdiction: { contains: stateName, mode: 'insensitive' } },
    orderBy: { publishedAt: 'desc' },
    take: Math.min(take, 30),
  });
  return rows.map((n) => ({ ...n, judgment: judge(n.goodVotes, n.badVotes, n.infoVotes) }));
}

export async function getNews(id: string, viewerUserId?: string) {
  const news = await prisma.civicNews.findFirst({
    where: { id, status: 'PUBLISHED' },
    include: { sources: { orderBy: { createdAt: 'asc' } } },
  });
  if (!news) return null;
  let myVote: { verdict: string; reason: string } | null = null;
  if (viewerUserId) {
    const v = await prisma.civicVote.findUnique({ where: { newsId_userId: { newsId: id, userId: viewerUserId } } });
    if (v) myVote = { verdict: v.verdict, reason: v.reason };
  }
  // Top reasons across all verdicts (public voice as part of the story).
  const votes = await prisma.civicVote.findMany({ where: { newsId: id }, select: { reason: true }, take: 500 });
  const counts = new Map<string, number>();
  for (const v of votes) counts.set(v.reason, (counts.get(v.reason) ?? 0) + 1);
  const topReasons = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([reason, count]) => ({ reason, count }));

  // History / pattern tracking: other published actions involving the same actor.
  const history = news.actorKey
    ? await prisma.civicNews.findMany({
        where: { actorKey: news.actorKey, status: 'PUBLISHED', id: { not: news.id } },
        orderBy: { publishedAt: 'desc' }, take: 8,
        select: { id: true, title: true, scope: true, publishedAt: true, goodVotes: true, badVotes: true, infoVotes: true },
      })
    : [];
  const historyItems = history.map((h) => ({ ...h, judgment: judge(h.goodVotes, h.badVotes, h.infoVotes) }));
  return { ...news, judgment: judge(news.goodVotes, news.badVotes, news.infoVotes), myVote, topReasons, history: historyItems };
}

/** Cast/change a public judgment. A reason is required. Recomputes tallies. */
export async function voteNews(newsId: string, userId: string, verdict: CivicVerdict, reason: string) {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.civicVote.findUnique({ where: { newsId_userId: { newsId, userId } } });
    if (existing) await tx.civicVote.update({ where: { id: existing.id }, data: { verdict, reason } });
    else await tx.civicVote.create({ data: { newsId, userId, verdict, reason } });
    const [g, b, i] = await Promise.all([
      tx.civicVote.count({ where: { newsId, verdict: 'GOOD_MOVE' } }),
      tx.civicVote.count({ where: { newsId, verdict: 'BAD_MOVE' } }),
      tx.civicVote.count({ where: { newsId, verdict: 'NEEDS_INFO' } }),
    ]);
    await tx.civicNews.update({ where: { id: newsId }, data: { goodVotes: g, badVotes: b, infoVotes: i } });
  });
  const n = await prisma.civicNews.findUniqueOrThrow({ where: { id: newsId } });
  return { judgment: judge(n.goodVotes, n.badVotes, n.infoVotes), myVerdict: verdict };
}
