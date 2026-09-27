import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/db/client';
import {
  submitCitizenReport, submitJournalistReport, listReports, getReport,
  setClaimStatus, issueCorrection,
} from '@/lib/reports/service';
import { contributorRecord } from '@/lib/reports/record';
import { applyForJournalist } from '@/lib/reports/journalist';
import { makeUser } from './setup/factory';

const journalistFields = {
  byline: 'Test Reporter',
  title: 'Council confirms route changes at public meeting',
  exactClaim: 'Routes 4 and 12 change on September 1.',
  videoShows: 'The director said routes 4 and 12 will be combined on September 1.',
  videoDoesntProve: 'It does not prove ridership impact.',
  confirmedParts: 'Confirmed: the dates. Unconfirmed: long-term plans.',
  origin: 'The official meeting recording.',
  whyImportant: 'Thousands of riders depend on these routes.',
  sourceUrl: 'https://example.org/source',
  affectedParty: 'City Transportation Dept',
  affectedResponse: 'Confirmed by email.',
  conflicts: 'None.',
  neutralityAffirmed: true as const,
};

describe('Community Reports — citizen lane', () => {
  it('a citizen post keeps its label and starts UNREVIEWED (no instant grade)', async () => {
    const u = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const { report, held } = await submitCitizenReport({
      authorUserId: u.id, displayName: 'A', anonymous: false, label: 'OPINION',
      title: 'My opinion on parking', body: 'I think overnight fees are unfair to night workers.',
    });
    expect(held).toBe(false);
    expect(report.label).toBe('OPINION');
    expect(report.claimStatus).toBe('UNREVIEWED');
    const { items } = await listReports({ lane: 'CITIZEN' });
    expect(items.some((r) => r.id === report.id)).toBe(true);
  });

  it('respects the anonymous flag but keeps the author on record', async () => {
    const u = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const { report } = await submitCitizenReport({
      authorUserId: u.id, displayName: 'Realname', anonymous: true, label: 'UNVERIFIED_TIP',
      title: 'A tip', body: 'I heard something worth checking out here.',
    });
    expect(report.displayName).toBe('Anonymous');
    expect(report.authorUserId).toBe(u.id);
  });
});

describe('Community Reports — claim status lifecycle & corrections', () => {
  it('a reviewer moves the claim status and records an event', async () => {
    const u = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const reviewer = await makeUser({ roles: ['MODERATOR'], mfa: true });
    const { report } = await submitCitizenReport({
      authorUserId: u.id, displayName: 'A', anonymous: true, label: 'UNVERIFIED_TIP',
      title: 'Claim to verify', body: 'Something that will later be verified by records.',
    });
    await setClaimStatus({ reportId: report.id, reviewerUserId: reviewer.id, toStatus: 'VERIFIED', rationale: 'Confirmed by official records.' });
    const full = await getReport(report.id);
    expect(full?.claimStatus).toBe('VERIFIED');
    expect(full?.statusEvents.length).toBe(1);
    expect(full?.statusEvents[0]?.toStatus).toBe('VERIFIED');
  });

  it('a voluntary correction is recorded and labels the post', async () => {
    const u = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const { report } = await submitCitizenReport({
      authorUserId: u.id, displayName: 'A', anonymous: true, label: 'FIRSTHAND_ACCOUNT',
      title: 'An account', body: 'Here is what I saw, though I may have a detail wrong.',
    });
    await issueCorrection({ reportId: report.id, correctedByUserId: u.id, note: 'I mixed up the date; it was Tuesday.' });
    const full = await getReport(report.id);
    expect(full?.label).toBe('CORRECTION_ISSUED');
    expect(full?.corrections.length).toBe(1);
  });
});

describe('Community Reports — journalist lane & qualification', () => {
  it('the journalist lane requires all structured fields; a threat is held', async () => {
    const u = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const { report, held } = await submitJournalistReport({
      authorUserId: u.id, ...journalistFields,
      videoShows: 'In the clip a person said “I will hurt you if you report this.”',
    });
    expect(held).toBe(true);
    expect(report.status).toBe('PENDING_REVIEW');
  });

  it('contributor record + journalist qualification reflects a real, verified track record', async () => {
    const u = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    // Too new → not eligible.
    let apply = await applyForJournalist(u.id);
    expect(apply.granted).toBe(false);

    // Build a record: 5 posts with sources, 2 verified.
    const ids: string[] = [];
    for (let n = 0; n < 5; n++) {
      const { report } = await submitCitizenReport({
        authorUserId: u.id, displayName: 'A', anonymous: false, label: 'EVIDENCE_SUBMITTED',
        title: `Documented claim ${n}`, body: `A sourced claim number ${n} with records attached.`,
        sourceUrl: 'https://example.org/record',
      });
      ids.push(report.id);
    }
    const reviewer = await makeUser({ roles: ['MODERATOR'], mfa: true });
    await setClaimStatus({ reportId: ids[0]!, reviewerUserId: reviewer.id, toStatus: 'VERIFIED', rationale: 'records' });
    await setClaimStatus({ reportId: ids[1]!, reviewerUserId: reviewer.id, toStatus: 'VERIFIED', rationale: 'records' });

    const record = await contributorRecord(u.id);
    expect(record.verified).toBe(2);
    expect(record.evidenceQuality).toBeGreaterThanOrEqual(50);

    apply = await applyForJournalist(u.id);
    expect(apply.granted).toBe(true);
    const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: u.id } });
    expect(dbUser.isJournalist).toBe(true);
  });
});
