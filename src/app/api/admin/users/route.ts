import { handle } from '@/lib/http/route';
import { requireAdmin } from '@/lib/auth/admin';
import { listUsers } from '@/lib/admin/service';
import { ok } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';

// Admin-only: list users (with search).
export const GET = handle(async (req) => {
  await requireAdmin();
  const q = new URL(req.url).searchParams.get('q') ?? undefined;
  return ok(await listUsers(q));
});
