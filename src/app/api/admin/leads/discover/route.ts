import { z } from 'zod';
import { handle } from '@/lib/http/route';
import { requireAdmin } from '@/lib/auth/admin';
import { ok, ApiError } from '@/lib/http/responses';
import { xaiEnabled } from '@/lib/leads/xai';
import { discoverAndStore } from '@/lib/leads/service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const schema = z.object({
  query: z.string().min(3).max(200),
  jurisdiction: z.string().max(80).optional(),
});

// Runs Grok Live Search and stores UNVERIFIED leads for staff triage. Admin-only.
export const POST = handle(async (req: Request) => {
  const staff = await requireAdmin();
  if (!xaiEnabled()) throw new ApiError('conflict', 'Grok is not configured. Set XAI_API_KEY to enable lead discovery.');
  const { query, jurisdiction } = schema.parse(await req.json());
  const result = await discoverAndStore(query, jurisdiction, staff.id);
  return ok(result);
});
