import { handle, clientIp } from '@/lib/http/route';
import { hashIp } from '@/lib/auth/crypto';
import { requirePermission } from '@/lib/permissions/guard';
import { moderationReportSchema } from '@/lib/validation/api';
import { reportContent, MODERATION_REASONS, type ModerationReason } from '@/lib/moderation/service';
import { ok, ApiError } from '@/lib/http/responses';

// Any registered user can report content (§23.1). Reporter identity stays private.
export const POST = handle(async (req) => {
  const user = await requirePermission('follow.manage', {
    entityType: 'content_report',
    ipHash: hashIp(clientIp(req)),
  });
  const body = moderationReportSchema.parse(await req.json());
  if (!MODERATION_REASONS.includes(body.reason as ModerationReason)) {
    throw new ApiError('validation_error', 'Unknown report reason.');
  }
  const report = await reportContent({
    reporterUserId: user.id,
    contentType: body.contentType,
    contentId: body.contentId,
    reason: body.reason as ModerationReason,
    details: body.details,
  });
  return ok({ id: report.id, status: report.status }, { status: 201 });
});
