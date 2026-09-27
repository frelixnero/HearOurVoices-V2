import { handle } from '@/lib/http/route';
import { requireModerator } from '@/lib/auth/admin';
import { tipStatusSchema } from '@/lib/validation/whistleblower';
import { setTipStatus } from '@/lib/whistleblower/service';
import { ok } from '@/lib/http/responses';

export const POST = handle(async (req: Request, ctx: { params: { id: string } }) => {
  const staff = await requireModerator();
  const { status } = tipStatusSchema.parse(await req.json());
  const t = await setTipStatus(ctx.params.id, status, staff.id);
  return ok({ id: t.id, status: t.status });
});
