import { z } from 'zod';
import { handle } from '@/lib/http/route';
import { requireAdmin } from '@/lib/auth/admin';
import { ok, ApiError } from '@/lib/http/responses';
import { openStatesEnabled } from '@/lib/legislation/openstates';
import { syncStale, JURISDICTIONS } from '@/lib/legislation/service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // rate-limited batch; stay within the serverless window

const schema = z.object({ limit: z.number().int().min(1).max(8).optional() });

// Syncs the stalest N of the 50 states + D.C. per call (rate-limited). Click
// repeatedly to cover all 51; the cron keeps them fresh automatically.
export const POST = handle(async (req: Request) => {
  const staff = await requireAdmin();
  if (!openStatesEnabled()) throw new ApiError('conflict', 'OpenStates is not configured. Set OPENSTATES_API_KEY.');
  const { limit } = schema.parse(await req.json().catch(() => ({})));
  const result = await syncStale(limit ?? 6, { actorUserId: staff.id });
  return ok({ ...result, totalJurisdictions: JURISDICTIONS.length });
});
