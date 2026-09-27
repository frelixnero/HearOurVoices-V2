import { prisma } from '@/lib/db/client';
import { handle, clientIp } from '@/lib/http/route';
import { hashIp } from '@/lib/auth/crypto';
import { requirePermission } from '@/lib/permissions/guard';
import { contributeSchema } from '@/lib/validation/api';
import { recordContribution } from '@/lib/civicfund/service';
import { paymentProvider } from '@/lib/payments/provider';
import { ok } from '@/lib/http/responses';

// Contribute to a campaign. Fees are computed server-side and the payment is run
// through the payment provider (mock in dev; Stripe Connect in prod, §16.7). The
// resulting ledger entry is recorded with the provider-reported fees.
export const POST = handle(async (req: Request, ctx: { params: { id: string } }) => {
  const user = await requirePermission('petition.sign', {
    entityType: 'campaign',
    entityId: ctx.params.id,
    ipHash: hashIp(clientIp(req)),
  });
  const body = contributeSchema.parse(await req.json());
  const campaign = await prisma.campaign.findUniqueOrThrow({ where: { id: ctx.params.id } });

  const provider = paymentProvider();
  const charge = await provider.charge({
    amountCents: body.amountCents,
    platformFeeRate: Number(campaign.platformFeeRate),
    campaignId: campaign.id,
    contributorUserId: user.id,
  });

  const c = await recordContribution({
    campaignId: campaign.id,
    contributorUserId: user.id,
    amountCents: body.amountCents,
    processorFeeCents: charge.fees.processorFeeCents,
    platformFeeCents: charge.fees.platformFeeCents,
    status: charge.status === 'succeeded' ? 'succeeded' : 'pending',
  });
  return ok(
    { id: c.id, status: c.status, providerRef: charge.providerRef, fees: charge.fees },
    { status: 201 },
  );
});
