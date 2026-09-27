import { handle, clientIp } from '@/lib/http/route';
import { hashIp } from '@/lib/auth/crypto';
import { requirePermission } from '@/lib/permissions/guard';
import { reviewSchema } from '@/lib/validation/api';
import { reviewClaim } from '@/lib/claims/service';
import { ok } from '@/lib/http/responses';

// Record a human review of a claim (research/legal reviewers). Moves the claim
// through the workflow but never publishes it (§13.5).
export const POST = handle(async (req: Request, ctx: { params: { id: string } }) => {
  const perm = 'evidence.review'; // research/legal/moderator/admin hold this
  const user = await requirePermission(perm, {
    entityType: 'claim',
    entityId: ctx.params.id,
    ipHash: hashIp(clientIp(req)),
  });
  const body = reviewSchema.parse(await req.json());
  const review = await reviewClaim({
    claimId: ctx.params.id,
    reviewerUserId: user.id,
    reviewType: body.reviewType,
    decision: body.decision,
    rationale: body.rationale,
  });
  return ok({ reviewId: review.id, decision: review.decision }, { status: 201 });
});
