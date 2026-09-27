import { handle } from '@/lib/http/route';
import { requireModerator } from '@/lib/auth/admin';
import { adminStatusSchema } from '@/lib/validation/admin';
import { setClaimStatus } from '@/lib/reports/service';
import { ok } from '@/lib/http/responses';

// Moderators/admins set a report's claim status (Unreviewed → Verified/Disproven…)
// with a rationale — this is how claims get graded after they can be evaluated.
export const POST = handle(async (req: Request, ctx: { params: { id: string } }) => {
  const staff = await requireModerator();
  const body = adminStatusSchema.parse(await req.json());
  const updated = await setClaimStatus({
    reportId: ctx.params.id, reviewerUserId: staff.id,
    toStatus: body.toStatus, rationale: body.rationale,
  });
  return ok({ id: updated.id, claimStatus: updated.claimStatus });
});
