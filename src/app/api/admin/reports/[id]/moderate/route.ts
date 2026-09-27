import { handle } from '@/lib/http/route';
import { requireModerator } from '@/lib/auth/admin';
import { moderateSchema } from '@/lib/validation/admin';
import { moderateReport } from '@/lib/admin/service';
import { ok } from '@/lib/http/responses';

export const POST = handle(async (req: Request, ctx: { params: { id: string } }) => {
  const staff = await requireModerator();
  const { action } = moderateSchema.parse(await req.json());
  const report = await moderateReport(ctx.params.id, action, staff.id);
  return ok({ id: report.id, status: report.status });
});
