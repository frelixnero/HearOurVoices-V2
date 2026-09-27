import { handle, clientIp } from '@/lib/http/route';
import { hashIp } from '@/lib/auth/crypto';
import { requirePermission } from '@/lib/permissions/guard';
import { redactionSchema } from '@/lib/validation/api';
import { redactEvidence } from '@/lib/evidence/service';
import { ok } from '@/lib/http/responses';

// Create a redacted public copy (Moderator+, MFA-gated). Never mutates the
// original (§14.6). The redacted copy goes to the PUBLIC bucket.
export const POST = handle(async (req: Request, ctx: { params: { id: string } }) => {
  const ip = clientIp(req);
  const user = await requirePermission('evidence.redact', {
    entityType: 'evidence',
    entityId: ctx.params.id,
    ipHash: hashIp(ip),
  });
  const body = redactionSchema.parse(await req.json());
  const updated = await redactEvidence({
    evidenceId: ctx.params.id,
    redactorUserId: user.id,
    redactedBytes: Buffer.from(body.redactedBase64, 'base64'),
    reason: body.reason,
    makePublic: body.makePublic,
  });
  return ok({ id: updated.id, redactionStatus: updated.redactionStatus, visibility: updated.visibility });
});
