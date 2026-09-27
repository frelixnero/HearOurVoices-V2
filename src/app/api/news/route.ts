import { handle } from '@/lib/http/route';
import { requireModerator } from '@/lib/auth/admin';
import { createNewsSchema } from '@/lib/validation/civic';
import { createNews, listNews } from '@/lib/civic/service';
import type { CivicScope } from '@/lib/civic/labels';
import { ok, paginated } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';

// Public feed, filterable by scope (local | state | nation).
export const GET = handle(async (req) => {
  const url = new URL(req.url);
  const s = url.searchParams.get('scope');
  const scope = s === 'LOCAL' || s === 'STATE' || s === 'NATION' ? (s as CivicScope) : undefined;
  const { items, nextCursor } = await listNews({ scope, cursor: url.searchParams.get('cursor') });
  return paginated(items, { nextCursor });
});

// Publishing civic news is a staff/journalist action (moderated) for legal safety.
export const POST = handle(async (req) => {
  const staff = await requireModerator();
  const body = createNewsSchema.parse(await req.json());
  const news = await createNews({ createdBy: staff.id, ...body });
  return ok({ id: news.id, scope: news.scope }, { status: 201 });
});
