import { prisma } from '@/lib/db/client';
import { handle } from '@/lib/http/route';
import { getCurrentUser } from '@/lib/auth/session';
import { paginated } from '@/lib/http/responses';

const PAGE_SIZE = 25;

// Public list with cursor pagination + optional filters (spec §45 rule 20).
// This is public content (§6.1 visitor) so it is NOT behind requirePermission —
// that guard is for privileged actions and requires a signed-in user. We still
// resolve the viewer (optional) for future personalization.
export const GET = handle(async (req) => {
  await getCurrentUser(); // optional viewer; no gate on public reads
  const url = new URL(req.url);
  const cursor = url.searchParams.get('cursor');
  const type = url.searchParams.get('type');
  const q = url.searchParams.get('q');

  const items = await prisma.jurisdiction.findMany({
    where: {
      active: true,
      ...(type ? { type } : {}),
      ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
    },
    orderBy: { name: 'asc' },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: { id: true, name: true, type: true, stateCode: true, parentId: true },
  });

  const hasMore = items.length > PAGE_SIZE;
  const page = hasMore ? items.slice(0, PAGE_SIZE) : items;
  const nextCursor = hasMore ? (page[page.length - 1]?.id ?? null) : null;
  return paginated(page, { cursor, nextCursor });
});
