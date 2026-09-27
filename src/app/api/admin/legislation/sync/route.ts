import { z } from 'zod';
import { handle } from '@/lib/http/route';
import { requireAdmin } from '@/lib/auth/admin';
import { ok, ApiError } from '@/lib/http/responses';
import { openStatesEnabled } from '@/lib/legislation/openstates';
import { syncJurisdiction } from '@/lib/legislation/service';

export const dynamic = 'force-dynamic';

const schema = z.object({
  jurisdiction: z.string().min(2).max(80), // "Texas", "United States", or an OCD id
  perPage: z.number().int().min(1).max(50).optional(),
});

// Admin triggers an ingestion pass for one jurisdiction. Verified public data only.
export const POST = handle(async (req: Request) => {
  const staff = await requireAdmin();
  if (!openStatesEnabled()) throw new ApiError('conflict', 'OpenStates is not configured. Set OPENSTATES_API_KEY to enable legislative sync.');
  const { jurisdiction, perPage } = schema.parse(await req.json());
  const result = await syncJurisdiction(jurisdiction, { perPage, actorUserId: staff.id });
  return ok(result);
});
