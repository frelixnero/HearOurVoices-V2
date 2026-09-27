// Legislation ingestion + read service. Pulls verified public-record bills from
// OpenStates and caches them. Red flags are derived ONLY from the documented
// record (never invented), and stay conservative to avoid false positives.
import { prisma } from '@/lib/db/client';
import { writeAudit } from '@/lib/audit/audit';
import { fetchBills, type OsBill, type OsVote } from './openstates';
import { legiScanMasterListIds, legiScanGetBill, type LsBill } from './legiscan';

interface NormalizedVote { date?: string; motion?: string; result?: string; yes: number; no: number; other: number }

function countOf(v: OsVote, needle: string): number {
  const c = (v.counts ?? []).find((x) => x.option?.toLowerCase() === needle);
  return c?.value ?? 0;
}
function normalizeVotes(votes: OsVote[] | undefined): NormalizedVote[] {
  return (votes ?? []).map((v) => ({
    date: v.start_date, motion: v.motion_text, result: v.result,
    yes: countOf(v, 'yes'), no: countOf(v, 'no'), other: countOf(v, 'other') + countOf(v, 'absent') + countOf(v, 'not voting') + countOf(v, 'abstain'),
  }));
}

/**
 * Conservative, fact-derived red flags. We only raise a flag when the RECORD is
 * unambiguous — e.g., a vote that passed with zero recorded yes/no tallies is a
 * voice/unrecorded vote. No heuristics that could smear a real legislator.
 */
function detectBillRedFlags(votes: NormalizedVote[]): string[] {
  const flags = new Set<string>();
  for (const v of votes) {
    const passed = (v.result ?? '').toLowerCase().includes('pass');
    if (passed && v.yes === 0 && v.no === 0) flags.add('Unrecorded voice vote');
  }
  return [...flags];
}

function normalize(b: OsBill) {
  const votes = normalizeVotes(b.votes);
  return {
    source: 'openstates',
    externalId: `openstates:${b.id}`,
    jurisdiction: b.jurisdiction?.name ?? 'Unknown',
    session: b.session ?? '',
    identifier: b.identifier,
    title: b.title,
    classification: b.classification ?? [],
    subjects: b.subject ?? [],
    latestActionDate: b.latest_action_date || null,
    latestActionDescription: b.latest_action_description || null,
    sponsors: (b.sponsorships ?? []).map((s) => ({ name: s.name, classification: s.classification ?? null, primary: !!s.primary })),
    actions: (b.actions ?? []).map((a) => ({ date: a.date ?? null, description: a.description ?? '', classification: a.classification ?? [] })),
    votes,
    sources: (b.sources ?? []).map((s) => ({ url: s.url, note: s.note ?? null })),
    sourceUrl: b.openstates_url || null,
    redFlags: detectBillRedFlags(votes),
  };
}

export interface NormalizedSponsor { name: string; classification: string | null; primary: boolean }

// Shared shape any source normalizes into before upsert.
export interface NormalizedBill {
  source: string; externalId: string; jurisdiction: string; session: string; identifier: string; title: string;
  classification: string[]; subjects: string[]; latestActionDate: string | null; latestActionDescription: string | null;
  sponsors: NormalizedSponsor[]; actions: unknown[]; votes: NormalizedVote[]; sources: unknown[]; sourceUrl: string | null; redFlags: string[];
}

export const nameKeyOf = (name: string): string =>
  name.toLowerCase().replace(/\b(rep|sen|representative|senator|dr|mr|mrs|ms)\.?\b/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export async function upsertBill(n: NormalizedBill) {
  const bill = await prisma.bill.upsert({
    where: { externalId: n.externalId },
    create: {
      source: n.source, externalId: n.externalId, jurisdiction: n.jurisdiction, session: n.session,
      identifier: n.identifier, title: n.title, classification: n.classification, subjects: n.subjects,
      latestActionDate: n.latestActionDate, latestActionDescription: n.latestActionDescription,
      sponsors: n.sponsors as never, actions: n.actions as never, votes: n.votes as never, sources: n.sources as never,
      sourceUrl: n.sourceUrl, redFlags: n.redFlags,
    },
    update: {
      title: n.title, classification: n.classification, subjects: n.subjects,
      latestActionDate: n.latestActionDate, latestActionDescription: n.latestActionDescription,
      sponsors: n.sponsors as never, actions: n.actions as never, votes: n.votes as never, sources: n.sources as never,
      sourceUrl: n.sourceUrl, redFlags: n.redFlags, lastSyncedAt: new Date(),
    },
  });
  // Rebuild normalized sponsor links so official record-profiles stay in sync.
  await prisma.billSponsor.deleteMany({ where: { billId: bill.id } });
  const links = n.sponsors.filter((s) => s.name?.trim()).map((s) => ({ billId: bill.id, name: s.name.trim(), nameKey: nameKeyOf(s.name), role: s.classification, primary: s.primary }));
  if (links.length) await prisma.billSponsor.createMany({ data: links });
}

// All 50 states + D.C. — the jurisdiction names OpenStates expects.
export const JURISDICTIONS: string[] = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
  'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia',
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Sync every jurisdiction in `list`, one at a time with a delay to respect the
 * OpenStates rate limit. Resilient: a failure on one jurisdiction is recorded
 * and the batch continues.
 */
export async function syncMany(
  list: string[],
  opts: { perPage?: number; delayMs?: number; actorUserId?: string; onProgress?: (j: string, r: { synced: number } | { error: string }) => void } = {},
) {
  const results: { jurisdiction: string; synced?: number; error?: string }[] = [];
  const delay = opts.delayMs ?? 6500; // ~9/min, under the free-tier 10/min ceiling
  for (let i = 0; i < list.length; i++) {
    const j = list[i]!;
    try {
      const r = await syncJurisdiction(j, { perPage: opts.perPage, actorUserId: opts.actorUserId });
      results.push({ jurisdiction: j, synced: r.synced });
      opts.onProgress?.(j, { synced: r.synced });
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      results.push({ jurisdiction: j, error });
      opts.onProgress?.(j, { error });
    }
    if (i < list.length - 1) await sleep(delay);
  }
  const totalSynced = results.reduce((a, r) => a + (r.synced ?? 0), 0);
  return { jurisdictions: results.length, totalSynced, results };
}

/** Sync the N jurisdictions that were refreshed longest ago (or never). For cron/rolling refresh. */
export async function syncStale(limit = 6, opts: { perPage?: number; actorUserId?: string } = {}) {
  const synced = await prisma.bill.groupBy({ by: ['jurisdiction'], _max: { lastSyncedAt: true } });
  const seen = new Map(synced.map((r) => [r.jurisdiction, r._max.lastSyncedAt?.getTime() ?? 0]));
  // Never-synced jurisdictions sort first (time 0), then oldest-synced.
  const ordered = [...JURISDICTIONS].sort((a, b) => (seen.get(a) ?? 0) - (seen.get(b) ?? 0));
  return syncMany(ordered.slice(0, limit), { ...opts, delayMs: 6500 });
}

/** Fetch recent bills for a jurisdiction and upsert them. Returns how many were synced. */
export async function syncJurisdiction(jurisdiction: string, opts: { perPage?: number; actorUserId?: string } = {}) {
  const bills = await fetchBills(jurisdiction, { perPage: opts.perPage ?? 20 });
  let synced = 0;
  for (const b of bills) {
    const n = normalize(b);
    await upsertBill(n);
    synced++;
  }
  await writeAudit({ actorUserId: opts.actorUserId ?? 'system', action: 'legislation.sync', entityType: 'bill', entityId: jurisdiction, after: { jurisdiction, synced } });
  return { jurisdiction, synced };
}

function normalizeLegiScan(b: LsBill, displayJurisdiction: string): NormalizedBill {
  const votes: NormalizedVote[] = (b.votes ?? []).map((v) => ({
    date: v.date, motion: v.desc, result: v.passed === 1 ? 'Passed' : v.passed === 0 ? 'Failed' : undefined,
    yes: v.yea ?? 0, no: v.nay ?? 0, other: (v.nv ?? 0) + (v.absent ?? 0),
  }));
  const lastHistory = (b.history ?? []).at(-1);
  return {
    source: 'legiscan',
    externalId: `legiscan:${b.bill_id}`,
    jurisdiction: displayJurisdiction,
    session: b.session?.session_name ?? '',
    identifier: b.bill_number ?? String(b.bill_id),
    title: b.title || b.description || `Bill ${b.bill_id}`,
    classification: b.bill_type ? [b.bill_type] : [],
    subjects: (b.subjects ?? []).map((s) => s.subject_name ?? '').filter(Boolean),
    latestActionDate: b.last_action_date || lastHistory?.date || null,
    latestActionDescription: b.last_action || lastHistory?.action || null,
    sponsors: (b.sponsors ?? []).map((s) => ({ name: s.name ?? 'Unknown', classification: s.role ?? null, primary: s.sponsor_type_id === 1 })),
    actions: (b.history ?? []).map((h) => ({ date: h.date ?? null, description: h.action ?? '', classification: [] })),
    votes,
    sources: [b.state_link, b.url].filter(Boolean).map((url) => ({ url: url as string, note: 'LegiScan / state record' })),
    sourceUrl: b.url || b.state_link || null,
    redFlags: detectBillRedFlags(votes),
  };
}

/** Sync bills for a state via LegiScan. `state` is a code ("TX", "US"); `displayJurisdiction` is the label shown. */
export async function syncLegiScan(state: string, displayJurisdiction: string, opts: { limit?: number; delayMs?: number; actorUserId?: string } = {}) {
  const ids = await legiScanMasterListIds(state);
  const take = ids.slice(0, Math.min(opts.limit ?? 15, 40));
  const delay = opts.delayMs ?? 700;
  let synced = 0;
  for (let i = 0; i < take.length; i++) {
    const bill = await legiScanGetBill(take[i]!);
    await upsertBill(normalizeLegiScan(bill, displayJurisdiction));
    synced++;
    if (i < take.length - 1) await sleep(delay);
  }
  await writeAudit({ actorUserId: opts.actorUserId ?? 'system', action: 'legislation.sync_legiscan', entityType: 'bill', entityId: displayJurisdiction, after: { state, synced } });
  return { jurisdiction: displayJurisdiction, synced };
}

export async function listBills(opts: { jurisdiction?: string; take?: number } = {}) {
  return prisma.bill.findMany({
    where: opts.jurisdiction ? { jurisdiction: opts.jurisdiction } : {},
    orderBy: [{ latestActionDate: 'desc' }, { lastSyncedAt: 'desc' }],
    take: Math.min(opts.take ?? 60, 200),
  });
}

export async function listJurisdictions() {
  const rows = await prisma.bill.groupBy({ by: ['jurisdiction'], _count: { _all: true } });
  return rows.map((r) => ({ jurisdiction: r.jurisdiction, count: r._count._all })).sort((a, b) => a.jurisdiction.localeCompare(b.jurisdiction));
}

export async function getBill(id: string) {
  return prisma.bill.findUnique({ where: { id } });
}

// ── Officials: legislative record built from verified sponsor data ───────────
export async function listOfficials() {
  const [grouped, names] = await Promise.all([
    prisma.billSponsor.groupBy({ by: ['nameKey'], _count: { _all: true } }),
    prisma.billSponsor.findMany({ distinct: ['nameKey'], select: { nameKey: true, name: true } }),
  ]);
  const nameByKey = new Map(names.map((n) => [n.nameKey, n.name]));
  return grouped
    .map((g) => ({ nameKey: g.nameKey, name: nameByKey.get(g.nameKey) ?? g.nameKey, bills: g._count._all }))
    .sort((a, b) => b.bills - a.bills || a.name.localeCompare(b.name));
}

export async function getOfficial(nameKey: string) {
  const links = await prisma.billSponsor.findMany({
    where: { nameKey },
    include: { bill: true },
    orderBy: { bill: { latestActionDate: 'desc' } },
    take: 200,
  });
  if (links.length === 0) return null;
  // Dedupe bills (a sponsor links once per bill already, but be safe).
  const seen = new Set<string>();
  const bills = links.filter((l) => (seen.has(l.bill.id) ? false : (seen.add(l.bill.id), true))).map((l) => ({ ...l.bill, primary: l.primary, role: l.role }));
  const name = links[0]!.name;
  const jurisdictions = [...new Set(bills.map((b) => b.jurisdiction))];
  const flagTotal = bills.reduce((a, b) => a + b.redFlags.length, 0);
  return { nameKey, name, jurisdictions, bills, flagTotal };
}
