// Search (spec §27). Phase-1 implementation uses Postgres case-insensitive
// contains across the primary public entities. A dedicated full-text index (§27)
// comes later. Only PUBLIC-visible claims are returned to keep restricted content
// out of results (§14.7).
import { prisma } from '@/lib/db/client';

export interface SearchHit {
  type: 'jurisdiction' | 'official' | 'agency' | 'claim';
  id: string;
  title: string;
  why: string; // why it matched (§27 "show why an item matched")
}

export async function search(q: string, limit = 20): Promise<SearchHit[]> {
  const query = q.trim();
  if (query.length < 2) return [];
  const like = { contains: query, mode: 'insensitive' as const };

  const [jurisdictions, people, agencies, claims] = await Promise.all([
    prisma.jurisdiction.findMany({ where: { name: like, active: true }, take: limit, select: { id: true, name: true } }),
    prisma.person.findMany({ where: { fullName: like }, take: limit, select: { id: true, fullName: true } }),
    prisma.agency.findMany({ where: { name: like }, take: limit, select: { id: true, name: true } }),
    // Real Postgres full-text search over PUBLISHED, PUBLIC claims only (§14.7, §27).
    // Enum columns are cast to text for the literal comparison.
    prisma.$queryRaw<{ id: string; text: string }[]>`
      SELECT id, text FROM "Claim"
      WHERE visibility::text = 'PUBLIC'
        AND status::text = 'PUBLISHED'
        AND to_tsvector('english', text) @@ plainto_tsquery('english', ${query})
      LIMIT ${limit}`,
  ]);

  const hits: SearchHit[] = [
    ...jurisdictions.map((j) => ({ type: 'jurisdiction' as const, id: j.id, title: j.name, why: 'name match' })),
    ...people.map((p) => ({ type: 'official' as const, id: p.id, title: p.fullName, why: 'name match' })),
    ...agencies.map((a) => ({ type: 'agency' as const, id: a.id, title: a.name, why: 'name match' })),
    ...claims.map((c) => ({
      type: 'claim' as const,
      id: c.id,
      title: c.text.slice(0, 100),
      why: 'claim text match',
    })),
  ];
  return hits.slice(0, limit);
}
