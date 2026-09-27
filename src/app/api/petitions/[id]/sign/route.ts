import { handle, clientIp } from '@/lib/http/route';
import { hashIp } from '@/lib/auth/crypto';
import { requirePermission } from '@/lib/permissions/guard';
import { prisma } from '@/lib/db/client';
import { ok, fail } from '@/lib/http/responses';

// Sign a petition (Verified Citizen+). One signature per user is enforced by a
// unique constraint — duplicate protection (§17.3).
export const POST = handle(async (req: Request, ctx: { params: { id: string } }) => {
  const user = await requirePermission('petition.sign', {
    entityType: 'petition',
    entityId: ctx.params.id,
    ipHash: hashIp(clientIp(req)),
  });
  try {
    const sig = await prisma.petitionSignature.create({
      data: { petitionId: ctx.params.id, userId: user.id },
    });
    return ok({ id: sig.id }, { status: 201 });
  } catch {
    return fail('conflict', 'You have already signed this petition.', 409);
  }
});
