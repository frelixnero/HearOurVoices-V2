import { handle, clientIp } from '@/lib/http/route';
import { hashIp } from '@/lib/auth/crypto';
import { requirePermission } from '@/lib/permissions/guard';
import { createEvidenceSchema } from '@/lib/validation/api';
import { createEvidence } from '@/lib/evidence/service';
import { ok } from '@/lib/http/responses';

// Upload evidence (Verified Citizen+). Stores the ORIGINAL in the restricted
// bucket; stays OWNER_ONLY until reviewed + redacted (§14, §25.2).
export const POST = handle(async (req) => {
  const ip = clientIp(req);
  const user = await requirePermission('evidence.upload', { entityType: 'evidence', ipHash: hashIp(ip) });
  const body = createEvidenceSchema.parse(await req.json());
  const ev = await createEvidence({
    uploaderUserId: user.id,
    title: body.title,
    description: body.description,
    evidenceType: body.evidenceType,
    bytes: Buffer.from(body.contentBase64, 'base64'),
    mimeType: body.mimeType,
    originalFilename: body.filename,
  });
  return ok({ id: ev.id, visibility: ev.visibility, originalHash: ev.originalHash }, { status: 201 });
});
