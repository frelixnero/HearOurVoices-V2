import { handle } from '@/lib/http/route';
import { requireModerator } from '@/lib/auth/admin';
import { moderateSchema } from '@/lib/validation/admin';
import { moderateTribute } from '@/lib/admin/service';
import { ok } from '@/lib/http/responses';

export const POST = handle(async (req: Request, ctx: { params: { id: string } }) => {
  const staff = await requireModerator();
  const { action } = moderateSchema.parse(await req.json());
  const t = await moderateTribute(ctx.params.id, action, staff.id);
  return ok({ id: t.id, status: t.status });
});
