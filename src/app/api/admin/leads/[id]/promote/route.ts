import { handle } from '@/lib/http/route';
import { requireAdmin } from '@/lib/auth/admin';
import { ok } from '@/lib/http/responses';
import { promoteLead } from '@/lib/leads/service';

// Creates a PENDING_REVIEW Civic News draft from a lead. Still requires a human
// to verify and approve it in the review queue before it can go public.
export const POST = handle(async (_req: Request, ctx: { params: { id: string } }) => {
  const staff = await requireAdmin();
  const result = await promoteLead(ctx.params.id, staff.id);
  return ok(result);
});
