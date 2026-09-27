import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/db/client';
import { createRecordsRequest, advanceRequest } from '@/lib/records/service';
import { buildScorecard, publishScorecard } from '@/lib/scoring/service';
import { follow, notifyFollowers, listNotifications } from '@/lib/notifications/service';
import { search } from '@/lib/search/service';
import { publishClaim, submitClaim, reviewClaim } from '@/lib/claims/service';
import { makeUser, makeJurisdiction } from './setup/factory';

describe('Records requests (spec §15) — integration', () => {
  it('creates a DRAFT with an event log and advances status', async () => {
    const u = await makeUser({ roles: ['VERIFIED_CITIZEN'] });
    const rr = await createRecordsRequest({
      creatorUserId: u.id, title: 'Contracts 2024', requestText: 'All vendor contracts.',
    });
    expect(rr.status).toBe('DRAFT');
    const sent = await advanceRequest({ requestId: rr.id, actorUserId: u.id, status: 'SENT' });
    expect(sent.status).toBe('SENT');
    expect(sent.sentAt).not.toBeNull();
    const events = await prisma.recordsRequestEvent.findMany({ where: { requestId: rr.id } });
    expect(events.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Scorecards (spec §10.5) — integration', () => {
  it('persists insufficient-data as null overall (never zero)', async () => {
    const method = await prisma.scorecardMethodology.create({
      data: { name: `M-${Date.now()}`, version: '1.0', entityType: 'official', effectiveFrom: new Date() },
    });
    const { scorecard, result } = await buildScorecard({
      entityType: 'official', entityId: 'person-x', methodologyId: method.id,
      periodStart: new Date('2024-01-01'), periodEnd: new Date('2024-06-30'),
      categories: [
        { name: 'Transparency', weight: 1, metrics: [{ name: 'a', normalizedScore: null, weight: 1, evidenceConfidence: 1 }] },
      ],
    });
    expect(result.insufficientData).toBe(true);
    expect(scorecard.overallScore).toBeNull();
    expect(scorecard.insufficientData).toBe(true);
    const pub = await publishScorecard({ scorecardId: scorecard.id, publisherUserId: 'admin-x' });
    expect(pub.publishedAt).not.toBeNull();
  });
});

describe('Notifications (spec §26) — integration', () => {
  it('fans out to followers of a target', async () => {
    const a = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const b = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    await follow({ userId: a.id, targetType: 'claim', targetId: 'claim-z' });
    await follow({ userId: b.id, targetType: 'claim', targetId: 'claim-z' });
    const sent = await notifyFollowers({
      targetType: 'claim', targetId: 'claim-z', type: 'claim_status_change', title: 'Claim updated',
    });
    expect(sent).toBe(2);
    const notes = await listNotifications(a.id);
    expect(notes.some((n) => n.title === 'Claim updated')).toBe(true);
  });
});

describe('Search (spec §27) — integration', () => {
  it('returns published claims but not restricted ones', async () => {
    const jur = await makeJurisdiction();
    const author = await makeUser({ roles: ['VERIFIED_CITIZEN'] });
    const legal = await makeUser({ roles: ['LEGAL_REVIEWER'], mfa: true });
    const uniqueWord = `zorptastic${Date.now()}`;

    // One published claim (searchable) and one draft (not searchable).
    const published = await submitClaim({
      submitterUserId: author.id, claimType: 'STATISTICAL_CLAIM',
      text: `Agency spent on ${uniqueWord} project`, targetType: 'agency', jurisdictionId: jur.id,
    });
    await reviewClaim({ claimId: published.id, reviewerUserId: legal.id, reviewType: 'research', decision: 'approve', rationale: 'ok' });
    await publishClaim({ claimId: published.id, publisherUserId: legal.id, confidenceLabel: 'STRONGLY_SUPPORTED' });

    await submitClaim({
      submitterUserId: author.id, claimType: 'ALLEGATION',
      text: `Secret ${uniqueWord} misconduct`, targetType: 'agency',
    });

    const hits = await search(uniqueWord);
    const claimHits = hits.filter((h) => h.type === 'claim');
    expect(claimHits.length).toBe(1); // only the published one
  });
});

describe('Petition signing (spec §17.3) — integration', () => {
  it('enforces one signature per user (duplicate protection)', async () => {
    const creator = await makeUser({ roles: ['CAMPAIGN_ORGANIZER'] });
    const signer = await makeUser({ roles: ['VERIFIED_CITIZEN'] });
    const petition = await prisma.petition.create({
      data: { creatorUserId: creator.id, title: 'Open the budget', requestText: 'Publish it.', targetType: 'agency', public: true },
    });
    await prisma.petitionSignature.create({ data: { petitionId: petition.id, userId: signer.id } });
    await expect(
      prisma.petitionSignature.create({ data: { petitionId: petition.id, userId: signer.id } }),
    ).rejects.toThrow(); // unique constraint
  });
});
