import { handle, clientIp } from '@/lib/http/route';
import { hashIp } from '@/lib/auth/crypto';
import { requirePermission } from '@/lib/permissions/guard';
import { claimStatusSchema } from '@/lib/validation/reports';
import { setClaimStatus } from '@/lib/reports/service';
import { ok } from '@/lib/http/responses';

// Move a claim's status (reviewer only, MFA-gated). Records a status event with
// the rationale — claims are graded only as they can actually be evaluated.
export const POST = handle(async (req: Request, ctx: { params: { id: string } }) => {
  const user = await requirePermission('moderation.act', {
    entityType: 'community_report', entityId: ctx.params.id, ipHash: hashIp(clientIp(req)),
  });
  const body = claimStatusSchema.parse(await req.json());
  const updated = await setClaimStatus({
    reportId: ctx.params.id, reviewerUserId: user.id,
    toStatus: body.toStatus, rationale: body.rationale,
  });
  return ok({ id: updated.id, claimStatus: updated.claimStatus });
});
