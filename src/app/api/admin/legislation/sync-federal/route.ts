import { handle } from '@/lib/http/route';
import { requireAdmin } from '@/lib/auth/admin';
import { ok, ApiError } from '@/lib/http/responses';
import { legiScanEnabled } from '@/lib/legislation/legiscan';
import { syncLegiScan } from '@/lib/legislation/service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Pulls current U.S. Congress bills (with sponsors + roll-call votes) via LegiScan.
export const POST = handle(async () => {
  const staff = await requireAdmin();
  if (!legiScanEnabled()) throw new ApiError('conflict', 'LegiScan is not configured. Set LEGISCAN_API_KEY.');
  const result = await syncLegiScan('US', 'United States', { limit: 12, actorUserId: staff.id });
  return ok(result);
});
