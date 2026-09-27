import { handle, clientIp } from '@/lib/http/route';
import { hashIp } from '@/lib/auth/crypto';
import { requirePermission } from '@/lib/permissions/guard';
import { recordsRequestSchema } from '@/lib/validation/api';
import { createRecordsRequest } from '@/lib/records/service';
import { ok } from '@/lib/http/responses';

// Draft a public-records request (Verified Citizen+). Starts as DRAFT (§15.3).
export const POST = handle(async (req) => {
  const user = await requirePermission('records_request.create', {
    entityType: 'records_request',
    ipHash: hashIp(clientIp(req)),
  });
  const body = recordsRequestSchema.parse(await req.json());
  const rr = await createRecordsRequest({
    creatorUserId: user.id,
    title: body.title,
    requestText: body.requestText,
    agencyId: body.agencyId,
    jurisdictionId: body.jurisdictionId,
    feeLimitCents: body.feeLimitCents,
    public: body.public,
  });
  return ok({ id: rr.id, status: rr.status }, { status: 201 });
});
