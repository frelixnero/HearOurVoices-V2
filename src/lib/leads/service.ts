// Leads service. AI-surfaced tips are stored as UNVERIFIED and only ever shown
// to staff for triage — there is no path from here to public content without a
// human creating verified content the normal way.
import { prisma } from '@/lib/db/client';
import { writeAudit } from '@/lib/audit/audit';
import { discoverLeads } from './xai';

export async function discoverAndStore(query: string, jurisdiction: string | undefined, actorUserId: string) {
  const leads = await discoverLeads(query, jurisdiction);
  let created = 0;
  for (const l of leads) {
    await prisma.lead.create({
      data: {
        query, jurisdiction: jurisdiction ?? null, title: l.title, summary: l.summary,
        citations: l.citations as never, source: 'grok', status: 'NEW', createdBy: actorUserId,
      },
    });
    created++;
  }
  await writeAudit({ actorUserId, action: 'leads.discover', entityType: 'lead', entityId: query, after: { query, jurisdiction, created } });
  return { query, created };
}

export async function listLeads(status: 'NEW' | 'DISMISSED' = 'NEW', take = 50) {
  return prisma.lead.findMany({ where: { status }, orderBy: { createdAt: 'desc' }, take: Math.min(take, 100) });
}

export async function dismissLead(id: string, actorUserId: string) {
  const lead = await prisma.lead.update({ where: { id }, data: { status: 'DISMISSED' } });
  await writeAudit({ actorUserId, action: 'leads.dismiss', entityType: 'lead', entityId: id });
  return lead;
}

interface Citation { url: string; title?: string }

/**
 * Turns a lead into a Civic News DRAFT held for review (PENDING_REVIEW). This is
 * a starting point only: citations are attached as UNVERIFIED sources and the
 * item still requires a human to verify and approve before it ever goes public.
 */
export async function promoteLead(id: string, actorUserId: string) {
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw new Error('Lead not found.');
  const citations = (lead.citations as unknown as Citation[]) ?? [];
  const scope = lead.jurisdiction ? 'STATE' : 'NATION';
  const news = await prisma.civicNews.create({
    data: {
      scope, authority: 'OTHER', title: lead.title.slice(0, 200),
      actorType: 'Unspecified — verify', jurisdiction: lead.jurisdiction ?? null,
      whatHappened: lead.summary,
      whyItMatters: 'AI-surfaced lead — confirm every claim against the linked sources before publishing.',
      pros: [], cons: [], alternatives: [], powerMap: [],
      status: 'PENDING_REVIEW', createdBy: actorUserId, publishedAt: null,
      sources: { create: citations.slice(0, 8).map((c) => ({ label: 'UNVERIFIED' as const, title: c.title || c.url, url: c.url })) },
    },
  });
  await prisma.lead.update({ where: { id }, data: { status: 'DISMISSED' } });
  await writeAudit({ actorUserId, action: 'leads.promote', entityType: 'civic_news', entityId: news.id, after: { fromLead: id } });
  return { newsId: news.id };
}
