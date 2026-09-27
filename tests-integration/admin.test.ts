import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/db/client';
import { adminOverview, reviewQueue, moderateStory, moderateReport, listUsers, setUserCapability } from '@/lib/admin/service';
import { submitCitizenReport } from '@/lib/reports/service';
import { submitStory } from '@/lib/stories/service';
import { makeUser } from './setup/factory';

describe('Admin backend — integration', () => {
  it('overview counts users and held items', async () => {
    const o = await adminOverview();
    expect(typeof o.users).toBe('number');
    expect(typeof o.storiesHeld).toBe('number');
  });

  it('a held story appears in the queue and can be approved', async () => {
    const author = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const admin = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    // A threat is held by the safety screen.
    const { story, held } = await submitStory({
      authorUserId: author.id, displayName: 'x', anonymous: true,
      body: 'In the message they said “I will hurt you if you tell.”', topics: ['other'], hideLocation: true,
    });
    expect(held).toBe(true);
    const q = await reviewQueue();
    expect(q.stories.some((s) => s.id === story.id)).toBe(true);

    const approved = await moderateStory(story.id, 'approve', admin.id);
    expect(approved.status).toBe('PUBLISHED');
    const q2 = await reviewQueue();
    expect(q2.stories.some((s) => s.id === story.id)).toBe(false);
  });

  it('a held report can be removed', async () => {
    const author = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const admin = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const { report } = await submitCitizenReport({
      authorUserId: author.id, displayName: 'x', anonymous: true, label: 'UNVERIFIED_TIP',
      title: 'A held report', body: 'They said “I will hurt you if you report this to anyone.”',
    });
    expect(report.status).toBe('PENDING_REVIEW');
    const removed = await moderateReport(report.id, 'remove', admin.id);
    expect(removed.status).toBe('REMOVED');
  });

  it('an admin can grant and revoke capabilities', async () => {
    const admin = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const target = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const granted = await setUserCapability({ targetUserId: target.id, capability: 'isModerator', value: true, actorUserId: admin.id });
    expect(granted.isModerator).toBe(true);
    const revoked = await setUserCapability({ targetUserId: target.id, capability: 'isModerator', value: false, actorUserId: admin.id });
    expect(revoked.isModerator).toBe(false);

    const suspended = await setUserCapability({ targetUserId: target.id, capability: 'suspended', value: true, actorUserId: admin.id });
    expect(suspended.status).toBe('SUSPENDED');

    const list = await listUsers();
    expect(list.some((u) => u.id === target.id)).toBe(true);
  });
});
