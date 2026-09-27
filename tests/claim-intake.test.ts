import { describe, it, expect } from 'vitest';
import { decideIntake, isSeriousAllegation } from '@/lib/claims/publishing';

describe('Claim intake — serious allegations never auto-publish (spec §25.2, §45 rule 5)', () => {
  it('flags allegation-type claims as serious', () => {
    expect(isSeriousAllegation({ claimType: 'ALLEGATION', text: 'anything' })).toBe(true);
  });

  it('flags misconduct keywords in otherwise ordinary claim types', () => {
    expect(
      isSeriousAllegation({ claimType: 'OBSERVATION', text: 'The clerk committed fraud.' }),
    ).toBe(true);
  });

  it('routes serious allegations to human research review, never to publish', () => {
    const d = decideIntake({ claimType: 'ALLEGATION', text: 'x', hasEvidence: true });
    expect(d.status).toBe('IN_RESEARCH_REVIEW');
    expect(d.autoPublish).toBe(false);
  });

  it('a benign claim with no evidence lands in NEEDS_EVIDENCE', () => {
    const d = decideIntake({ claimType: 'OBSERVATION', text: 'The park reopened.', hasEvidence: false });
    expect(d.status).toBe('NEEDS_EVIDENCE');
    expect(d.autoPublish).toBe(false);
  });

  it('a benign claim with evidence is queued (still not auto-published)', () => {
    const d = decideIntake({ claimType: 'OBSERVATION', text: 'The park reopened.', hasEvidence: true });
    expect(d.status).toBe('SUBMITTED');
    expect(d.autoPublish).toBe(false);
  });

  it('NO intake path ever returns autoPublish=true', () => {
    const cases = [
      { claimType: 'ALLEGATION' as const, text: 'x', hasEvidence: true },
      { claimType: 'OBSERVATION' as const, text: 'y', hasEvidence: false },
      { claimType: 'OPINION' as const, text: 'z', hasEvidence: true },
    ];
    for (const c of cases) expect(decideIntake(c).autoPublish).toBe(false);
  });
});
