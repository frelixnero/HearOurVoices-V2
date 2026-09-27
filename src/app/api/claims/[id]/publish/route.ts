import { handle, clientIp } from '@/lib/http/route';
import { hashIp } from '@/lib/auth/crypto';
import { requirePermission } from '@/lib/permissions/guard';
import { publishClaimSchema } from '@/lib/validation/api';
import { publishClaim } from '@/lib/claims/service';
import { ok, ApiError } from '@/lib/http/responses';

// The human publish gate (Legal/Admin, MFA-gated). Requires a prior review;
// serious allegations therefore cannot reach the public without human sign-off.
export const POST = handle(async (req: Request, ctx: { params: { id: string } }) => {
  const user = await requirePermission('claim.publish', {
    entityType: 'claim',
    entityId: ctx.params.id,
    ipHash: hashIp(clientIp(req)),
  });
  const body = publishClaimSchema.parse(await req.json());
  try {
    const claim = await publishClaim({
      claimId: ctx.params.id,
      publisherUserId: user.id,
      confidenceLabel: body.confidenceLabel,
    });
    return ok({ id: claim.id, status: claim.status, visibility: claim.visibility });
  } catch (e) {
    throw new ApiError('conflict', (e as Error).message);
  }
});
