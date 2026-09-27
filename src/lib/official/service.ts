// Official response & correction service (spec §24). A response is displayed
// alongside a claim but is NEVER automatically treated as true (§24). Corrections
// are visible and timestamped.
import { prisma } from '@/lib/db/client';
import { writeAudit } from '@/lib/audit/audit';

export async function addOfficialResponse(input: {
  responderUserId: string;
  claimId?: string;
  subjectType: 'claim' | 'scorecard' | 'official_profile';
  subjectId: string;
  responseType: 'context' | 'dispute' | 'correction_request' | 'official_statement' | 'appeal';
  body: string;
}) {
  const response = await prisma.officialResponse.create({
    data: {
      responderUserId: input.responderUserId,
      claimId: input.claimId ?? null,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      responseType: input.responseType,
      body: input.body,
    },
  });
  if (input.claimId) {
    await prisma.claim.update({
      where: { id: input.claimId },
      data: { officialResponseStatus: 'responded' },
    });
  }
  await writeAudit({
    actorUserId: input.responderUserId,
    action: 'official.response_added',
    entityType: input.subjectType,
    entityId: input.subjectId,
    after: { responseType: input.responseType },
  });
  return response;
}

export async function publishCorrection(input: {
  correctedByUserId: string;
  claimId?: string;
  subjectType: string;
  subjectId: string;
  description: string;
}) {
  const correction = await prisma.correction.create({
    data: {
      claimId: input.claimId ?? null,
      subjectType: input.subjectType,
      subjectId: input.subjectId,
      description: input.description,
      correctedBy: input.correctedByUserId,
      visible: true,
    },
  });
  await writeAudit({
    actorUserId: input.correctedByUserId,
    action: 'correction.published',
    entityType: input.subjectType,
    entityId: input.subjectId,
    after: { correctionId: correction.id },
  });
  return correction;
}
