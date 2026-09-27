import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/db/client';
import { reportContent, actOnContent, appealModeration, decideAppeal } from '@/lib/moderation/service';
import {
  createCampaign, recordContribution, proposeExpense, approveExpense, getLedger,
} from '@/lib/civicfund/service';
import { addOfficialResponse, publishCorrection } from '@/lib/official/service';
import { makeUser } from './setup/factory';

describe('Moderation (spec §23) — integration', () => {
  it('an action requires a public explanation and is audited', async () => {
    const reporter = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const mod = await makeUser({ roles: ['MODERATOR'], mfa: true });
    await reportContent({
      reporterUserId: reporter.id, contentType: 'claim', contentId: 'claim-x', reason: 'harassment',
    });
    const action = await actOnContent({
      moderatorUserId: mod.id, contentType: 'claim', contentId: 'claim-x',
      actionType: 'limit', reason: 'harassment', publicExplanation: 'Contains targeted abuse.',
    });
    expect(action.id).toBeTruthy();
    const audit = await prisma.auditLog.findFirst({
      where: { action: 'moderation.limit', entityId: 'claim-x' },
    });
    expect(audit).not.toBeNull();
  });

  it('an appeal cannot be decided by the moderator who acted (§23.6)', async () => {
    const mod = await makeUser({ roles: ['MODERATOR'], mfa: true });
    const user = await makeUser({ roles: ['VERIFIED_CITIZEN'] });
    const action = await actOnContent({
      moderatorUserId: mod.id, contentType: 'claim', contentId: 'claim-y',
      actionType: 'remove', reason: 'spam', publicExplanation: 'Duplicate spam.',
    });
    const appeal = await appealModeration({
      moderationActionId: action.id, appellantUserId: user.id, reason: 'Not spam.',
    });
    await expect(
      decideAppeal({ appealId: appeal.id, reviewerUserId: mod.id, decision: 'upheld' }),
    ).rejects.toThrow(/other than the original moderator/);

    const other = await makeUser({ roles: ['MODERATOR'], mfa: true });
    const decided = await decideAppeal({ appealId: appeal.id, reviewerUserId: other.id, decision: 'reversed' });
    expect(decided.decision).toBe('reversed');
  });
});

describe('CivicFund ledger (spec §16.5, §16.7) — integration', () => {
  it('computes gross, fees, spent, committed, and available correctly', async () => {
    const organizer = await makeUser({ roles: ['CAMPAIGN_ORGANIZER'] });
    const donor = await makeUser({ roles: ['VERIFIED_CITIZEN'] });
    const campaign = await createCampaign({
      creatorUserId: organizer.id, campaignType: 'public_records', title: 'Get the contracts',
      description: 'Pay copy fees', goalAmountCents: 50000, refundPolicy: 'Refund unused funds.',
    });
    // $200 contributed, $6 processor + $10 platform fee.
    await recordContribution({
      campaignId: campaign.id, contributorUserId: donor.id,
      amountCents: 20000, processorFeeCents: 600, platformFeeCents: 1000,
    });
    let ledger = await getLedger(campaign.id);
    expect(ledger.grossContributionsCents).toBe(20000);
    expect(ledger.netRaisedCents).toBe(20000 - 600 - 1000);
    expect(ledger.availableCents).toBe(18400);

    // Approve a $100 expense — within funds.
    const ok = await proposeExpense({
      campaignId: campaign.id, category: 'copy_fees', vendor: 'County Clerk',
      amountCents: 10000, description: 'Copy fees',
    });
    await approveExpense({ expenseId: ok.id, approverUserId: organizer.id });
    ledger = await getLedger(campaign.id);
    expect(ledger.committedCents).toBe(10000);
    expect(ledger.availableCents).toBe(8400);
  });

  it('refuses to approve an expense that exceeds available funds (§16.7)', async () => {
    const organizer = await makeUser({ roles: ['CAMPAIGN_ORGANIZER'] });
    const donor = await makeUser({ roles: ['VERIFIED_CITIZEN'] });
    const campaign = await createCampaign({
      creatorUserId: organizer.id, campaignType: 'public_records', title: 'Small',
      description: 'x', goalAmountCents: 10000, refundPolicy: 'Refund.',
    });
    await recordContribution({
      campaignId: campaign.id, contributorUserId: donor.id,
      amountCents: 5000, processorFeeCents: 0, platformFeeCents: 0,
    });
    const tooBig = await proposeExpense({
      campaignId: campaign.id, category: 'x', vendor: 'v', amountCents: 9000, description: 'too big',
    });
    await expect(
      approveExpense({ expenseId: tooBig.id, approverUserId: organizer.id }),
    ).rejects.toThrow(/exceeds available/);
  });
});

describe('Official response & correction (spec §24) — integration', () => {
  it('an official response is stored and flags the claim without asserting truth', async () => {
    const official = await makeUser({ roles: ['OFFICIAL_REPRESENTATIVE'] });
    const author = await makeUser({ roles: ['VERIFIED_CITIZEN'] });
    const claim = await prisma.claim.create({
      data: {
        submitterUserId: author.id, claimType: 'STATISTICAL_CLAIM',
        text: 'demo', targetType: 'agency', status: 'PUBLISHED', visibility: 'PUBLIC',
      },
    });
    const resp = await addOfficialResponse({
      responderUserId: official.id, claimId: claim.id, subjectType: 'claim',
      subjectId: claim.id, responseType: 'dispute', body: 'These were emergency exemptions.',
    });
    expect(resp.responseType).toBe('dispute');
    const updated = await prisma.claim.findUniqueOrThrow({ where: { id: claim.id } });
    expect(updated.officialResponseStatus).toBe('responded');
    // The claim confidence label is unchanged by a mere response (§24).
    expect(updated.confidenceLabel).not.toBe('FALSE');

    const corr = await publishCorrection({
      correctedByUserId: official.id, claimId: claim.id, subjectType: 'claim',
      subjectId: claim.id, description: 'Count corrected from 3 to 2.',
    });
    expect(corr.visible).toBe(true);
  });
});
