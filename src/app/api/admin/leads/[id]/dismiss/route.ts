import { handle } from '@/lib/http/route';
import { requireAdmin } from '@/lib/auth/admin';
import { ok } from '@/lib/http/responses';
import { dismissLead } from '@/lib/leads/service';

export const POST = handle(async (_req: Request, ctx: { params: { id: string } }) => {
  const staff = await requireAdmin();
  const lead = await dismissLead(ctx.params.id, staff.id);
  return ok({ id: lead.id, status: lead.status });
});
