import { handle, clientIp } from '@/lib/http/route';
import { hashIp } from '@/lib/auth/crypto';
import { requirePermission } from '@/lib/permissions/guard';
import { createCampaignSchema } from '@/lib/validation/api';
import { createCampaign } from '@/lib/civicfund/service';
import { ok } from '@/lib/http/responses';

// Create a CivicFund campaign (starts as DRAFT; goes live only after review §16.3).
export const POST = handle(async (req) => {
  const user = await requirePermission('records_request.create', {
    entityType: 'campaign',
    ipHash: hashIp(clientIp(req)),
  });
  const body = createCampaignSchema.parse(await req.json());
  const campaign = await createCampaign({
    creatorUserId: user.id,
    campaignType: body.campaignType,
    title: body.title,
    description: body.description,
    jurisdictionId: body.jurisdictionId,
    goalAmountCents: body.goalAmountCents,
    refundPolicy: body.refundPolicy,
  });
  return ok({ id: campaign.id, status: campaign.status }, { status: 201 });
});
