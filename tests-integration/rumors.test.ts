import { describe, it, expect } from 'vitest';
import { submitRumor, listRumors, voteRumor, getRumor, addRumorEvidence, setRumorVerdict } from '@/lib/rumors/service';
import { makeUser } from './setup/factory';

describe('Rumors service — integration', () => {
  it('a new rumor starts UNVERIFIED and appears in the list', async () => {
    const u = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const { rumor, held } = await submitRumor({
      submitterUserId: u.id, displayName: 'x', anonymous: true,
      text: 'I heard the office is moving downtown next year.', topic: 'workplace',
    });
    expect(held).toBe(false);
    const { items } = await listRumors({ topic: 'workplace' });
    const found = items.find((r) => r.id === rumor.id);
    expect(found?.grading.grade).toBe('UNVERIFIED');
  });

  it('votes accumulate and change the grade; a repeat vote retracts it', async () => {
    const u = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const { rumor } = await submitRumor({
      submitterUserId: u.id, displayName: 'x', anonymous: true, text: 'A rumor to grade by voting.',
    });
    // 6 accurate voters push it past the threshold toward "accurate".
    for (let n = 0; n < 6; n++) {
      const voter = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
      await voteRumor(rumor.id, voter.id, 'accurate');
    }
    const graded = await getRumor(rumor.id);
    expect(graded?.grading.grade).toBe('TRUE');
    expect(graded?.grading.totalVotes).toBe(6);

    // A voter voting the same way twice retracts their vote.
    const flip = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    await voteRumor(rumor.id, flip.id, 'inaccurate');
    const after1 = await getRumor(rumor.id);
    const twice = await voteRumor(rumor.id, flip.id, 'inaccurate'); // retract
    expect(twice.grading.totalVotes).toBe((after1?.grading.totalVotes ?? 0) - 1);
  });

  it('a reviewer verdict overrides community votes', async () => {
    const u = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const reviewer = await makeUser({ roles: ['MODERATOR'], mfa: true });
    const { rumor } = await submitRumor({
      submitterUserId: u.id, displayName: 'x', anonymous: true, text: 'A rumor the community likes but is false.',
    });
    for (let n = 0; n < 8; n++) {
      const voter = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
      await voteRumor(rumor.id, voter.id, 'accurate');
    }
    const before = await getRumor(rumor.id);
    expect(before?.grading.grade).toBe('TRUE'); // crowd says accurate
    await setRumorVerdict({ rumorId: rumor.id, reviewerUserId: reviewer.id, grade: 'FALSE', rationale: 'Official records contradict this.' });
    const after = await getRumor(rumor.id);
    expect(after?.grading.grade).toBe('FALSE');
    expect(after?.grading.source).toBe('reviewer');
  });

  it('evidence can be attached to a rumor', async () => {
    const u = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const { rumor } = await submitRumor({ submitterUserId: u.id, displayName: 'x', anonymous: true, text: 'A rumor needing evidence.' });
    await addRumorEvidence({ rumorId: rumor.id, userId: u.id, displayName: 'Sam', anonymous: false, stance: 'refutes', note: 'The official notice says otherwise.', url: 'https://example.org/notice' });
    const full = await getRumor(rumor.id);
    expect(full?.evidence.length).toBe(1);
    expect(full?.evidence[0]?.stance).toBe('refutes');
  });
});
