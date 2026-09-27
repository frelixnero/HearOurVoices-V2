import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/db/client';
import { submitClaim, reviewClaim, publishClaim } from '@/lib/claims/service';
import { makeUser } from './setup/factory';

describe('Claim lifecycle (spec §13.5, §25.2) — integration', () => {
  it('a serious allegation is routed to review and is NOT public on submit', async () => {
    const u = await makeUser({ roles: ['VERIFIED_CITIZEN'] });
    const claim = await submitClaim({
      submitterUserId: u.id,
      claimType: 'ALLEGATION',
      text: 'The official accepted a bribe for a contract.',
      targetType: 'person',
    });
    expect(claim.status).toBe('IN_RESEARCH_REVIEW');
    expect(claim.seriousAllegation).toBe(true);
    expect(claim.visibility).toBe('OWNER_ONLY');
  });

  it('cannot publish a claim that has never been reviewed', async () => {
    const u = await makeUser({ roles: ['VERIFIED_CITIZEN'] });
    const claim = await submitClaim({
      submitterUserId: u.id, claimType: 'OBSERVATION',
      text: 'The park reopened on Monday morning.', targetType: 'agency',
      evidenceIds: [],
    });
    await expect(
      publishClaim({ claimId: claim.id, publisherUserId: u.id, confidenceLabel: 'VERIFIED' }),
    ).rejects.toThrow(/reviewed by a human/);
  });

  it('a reviewed claim can be published and becomes PUBLIC with an audit trail', async () => {
    const author = await makeUser({ roles: ['VERIFIED_CITIZEN'] });
    const legal = await makeUser({ roles: ['LEGAL_REVIEWER'], mfa: true });
    const claim = await submitClaim({
      submitterUserId: author.id, claimType: 'STATISTICAL_CLAIM',
      text: 'The agency issued 3 no-bid contracts in Q1.', targetType: 'agency',
    });
    await reviewClaim({
      claimId: claim.id, reviewerUserId: legal.id, reviewType: 'research',
      decision: 'approve', rationale: 'Sources check out.',
    });
    const published = await publishClaim({
      claimId: claim.id, publisherUserId: legal.id, confidenceLabel: 'STRONGLY_SUPPORTED',
    });
    expect(published.status).toBe('PUBLISHED');
    expect(published.visibility).toBe('PUBLIC');

    const audit = await prisma.auditLog.findFirst({
      where: { action: 'claim.published', entityId: claim.id },
    });
    expect(audit).not.toBeNull();
  });
});
