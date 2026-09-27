import { handle, clientIp } from '@/lib/http/route';
import { hashIp } from '@/lib/auth/crypto';
import { requirePermission } from '@/lib/permissions/guard';
import { officialResponseSchema } from '@/lib/validation/api';
import { addOfficialResponse } from '@/lib/official/service';
import { ok } from '@/lib/http/responses';

// An official/affected party responds to a claim (§24). Displayed next to the
// claim; never treated as automatically true.
export const POST = handle(async (req: Request, ctx: { params: { id: string } }) => {
  const user = await requirePermission('official.respond', {
    entityType: 'claim',
    entityId: ctx.params.id,
    ipHash: hashIp(clientIp(req)),
  });
  const body = officialResponseSchema.parse(await req.json());
  const resp = await addOfficialResponse({
    responderUserId: user.id,
    claimId: ctx.params.id,
    subjectType: 'claim',
    subjectId: ctx.params.id,
    responseType: body.responseType,
    body: body.body,
  });
  return ok({ id: resp.id, responseType: resp.responseType }, { status: 201 });
});
