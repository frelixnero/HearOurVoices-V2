import { describe, it, expect } from 'vitest';
import { prisma } from '@/lib/db/client';
import { submitStory, listStories, toggleSupport, addComment, getStory } from '@/lib/stories/service';
import { makeUser } from './setup/factory';

describe('Stories service — integration', () => {
  it('publishes an ordinary story and it appears in the feed', async () => {
    const u = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const { story, held } = await submitStory({
      authorUserId: u.id, displayName: 'Alex', anonymous: false,
      body: 'Sharing my experience helped me feel less alone.', topics: ['workplace'], hideLocation: true,
    });
    expect(held).toBe(false);
    expect(story.status).toBe('PUBLISHED');
    const { items } = await listStories({ topic: 'workplace' });
    expect(items.some((s) => s.id === story.id)).toBe(true);
  });

  it('respects the anonymous flag for display name', async () => {
    const u = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const { story } = await submitStory({
      authorUserId: u.id, displayName: 'Realname', anonymous: true,
      body: 'A story shared without my name.', topics: [], hideLocation: true,
    });
    expect(story.displayName).toBe('Anonymous');
    expect(story.authorUserId).toBe(u.id); // still known to the platform
  });

  it('holds a threatening story for review (not in feed)', async () => {
    const u = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const { story, held } = await submitStory({
      authorUserId: u.id, displayName: 'x', anonymous: true,
      body: 'I will hurt you if you tell anyone.', topics: ['other'], hideLocation: true,
    });
    expect(held).toBe(true);
    expect(story.status).toBe('PENDING_REVIEW');
    const { items } = await listStories({ topic: 'other' });
    expect(items.some((s) => s.id === story.id)).toBe(false);
  });

  it('support is one-per-user and toggles the count', async () => {
    const author = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const fan = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const { story } = await submitStory({
      authorUserId: author.id, displayName: 'a', anonymous: true,
      body: 'A story people can support.', topics: [], hideLocation: true,
    });
    const first = await toggleSupport(story.id, fan.id);
    expect(first).toEqual({ supported: true, count: 1 });
    const second = await toggleSupport(story.id, fan.id); // same user un-supports
    expect(second).toEqual({ supported: false, count: 0 });
  });

  it('adds a supportive comment that shows on the story', async () => {
    const author = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const helper = await makeUser({ roles: ['REGISTERED_CITIZEN'] });
    const { story } = await submitStory({
      authorUserId: author.id, displayName: 'a', anonymous: true,
      body: 'A story that needs support.', topics: [], hideLocation: true,
    });
    const { held } = await addComment({
      storyId: story.id, authorUserId: helper.id, displayName: 'Sam', anonymous: false,
      body: 'You are so brave. Thank you for sharing.',
    });
    expect(held).toBe(false);
    const full = await getStory(story.id);
    expect(full?.comments.some((c) => c.displayName === 'Sam')).toBe(true);
    expect(full?.commentCount).toBe(1);
  });
});
