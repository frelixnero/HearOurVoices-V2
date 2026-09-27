import { handle, clientIp } from '@/lib/http/route';
import { hashIp } from '@/lib/auth/crypto';
import { requirePermission } from '@/lib/permissions/guard';
import { moderationActionSchema } from '@/lib/validation/api';
import { actOnContent, MODERATION_REASONS, type ModerationReason } from '@/lib/moderation/service';
import { ok, ApiError } from '@/lib/http/responses';

// Take a moderation action (Moderator+, MFA-gated). Reason + public explanation
// required (§23.4). Action is audited.
export const POST = handle(async (req) => {
  const user = await requirePermission('moderation.act', {
    entityType: 'moderation',
    ipHash: hashIp(clientIp(req)),
  });
  const body = moderationActionSchema.parse(await req.json());
  if (!MODERATION_REASONS.includes(body.reason as ModerationReason)) {
    throw new ApiError('validation_error', 'Unknown moderation reason.');
  }
  const action = await actOnContent({
    moderatorUserId: user.id,
    contentType: body.contentType,
    contentId: body.contentId,
    actionType: body.actionType,
    reason: body.reason as ModerationReason,
    publicExplanation: body.publicExplanation,
  });
  return ok({ id: action.id, actionType: action.actionType }, { status: 201 });
});
