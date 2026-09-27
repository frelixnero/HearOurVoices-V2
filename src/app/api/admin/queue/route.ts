import { handle } from '@/lib/http/route';
import { requireModerator } from '@/lib/auth/admin';
import { reviewQueue } from '@/lib/admin/service';
import { ok } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  await requireModerator();
  return ok(await reviewQueue());
});
