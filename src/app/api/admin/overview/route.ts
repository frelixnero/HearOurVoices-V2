import { handle } from '@/lib/http/route';
import { requireModerator } from '@/lib/auth/admin';
import { adminOverview } from '@/lib/admin/service';
import { ok } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  const staff = await requireModerator();
  return ok({ staff: { isAdmin: staff.isAdmin, isModerator: staff.isModerator, displayName: staff.displayName }, overview: await adminOverview() });
});
