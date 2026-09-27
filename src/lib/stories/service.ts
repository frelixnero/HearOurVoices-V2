// Stories service — the core of the story-sharing product. Submitting runs the
// safety screen; supporting and commenting reuse the moderation/audit foundation.
import { prisma } from '@/lib/db/client';
import { writeAudit } from '@/lib/audit/audit';
import { screenStory } from './safety';

export interface SubmitStoryInput {
  authorUserId: string;
  displayName: string;
  anonymous: boolean;
  title?: string;
  body: string;
  topics: string[];
  hideLocation: boolean;
}

export async function submitStory(input: SubmitStoryInput) {
  const screen = screenStory(input.body);
  const publish = screen.decision === 'publish';

  const story = await prisma.story.create({
    data: {
      authorUserId: input.authorUserId,
      displayName: input.anonymous ? 'Anonymous' : input.displayName,
      anonymous: input.anonymous,
      title: input.title ?? null,
      body: input.body,
      topics: input.topics,
      hideLocation: input.hideLocation,
      status: publish ? 'PUBLISHED' : 'PENDING_REVIEW',
      publishedAt: publish ? new Date() : null,
    },
  });
  await writeAudit({
    actorUserId: input.authorUserId,
    action: publish ? 'story.published' : 'story.held_for_review',
    entityType: 'story',
    entityId: story.id,
    after: { status: story.status },
  });
  return { story, crisis: screen.crisis, held: !publish, reason: screen.reason };
}

export interface FeedOptions {
  topic?: string;
  cursor?: string | null;
  take?: number;
}

export async function listStories(opts: FeedOptions = {}) {
  const take = Math.min(opts.take ?? 20, 50);
  const rows = await prisma.story.findMany({
    where: {
      status: 'PUBLISHED',
      ...(opts.topic && opts.topic !== 'all' ? { topics: { has: opts.topic } } : {}),
    },
    orderBy: { publishedAt: 'desc' },
    take: take + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
  });
  const hasMore = rows.length > take;
  const items = hasMore ? rows.slice(0, take) : rows;
  return { items, nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null };
}

export async function getStory(id: string) {
  return prisma.story.findFirst({
    where: { id, status: 'PUBLISHED' },
    include: {
      comments: { where: { status: 'PUBLISHED' }, orderBy: { createdAt: 'asc' }, take: 100 },
    },
  });
}

/** Toggle a user's support ("heart"). Returns the new supported state + count. */
export async function toggleSupport(storyId: string, userId: string) {
  const existing = await prisma.storySupport.findUnique({
    where: { storyId_userId: { storyId, userId } },
  });
  if (existing) {
    await prisma.storySupport.delete({ where: { id: existing.id } });
    const story = await prisma.story.update({
      where: { id: storyId }, data: { supportCount: { decrement: 1 } },
    });
    return { supported: false, count: story.supportCount };
  }
  await prisma.storySupport.create({ data: { storyId, userId } });
  const story = await prisma.story.update({
    where: { id: storyId }, data: { supportCount: { increment: 1 } },
  });
  return { supported: true, count: story.supportCount };
}

export async function addComment(input: {
  storyId: string;
  authorUserId: string;
  displayName: string;
  anonymous: boolean;
  body: string;
}) {
  const screen = screenStory(input.body);
  const comment = await prisma.storyComment.create({
    data: {
      storyId: input.storyId,
      authorUserId: input.authorUserId,
      displayName: input.anonymous ? 'Anonymous' : input.displayName,
      anonymous: input.anonymous,
      body: input.body,
      status: screen.decision === 'publish' ? 'PUBLISHED' : 'PENDING_REVIEW',
    },
  });
  if (comment.status === 'PUBLISHED') {
    await prisma.story.update({ where: { id: input.storyId }, data: { commentCount: { increment: 1 } } });
  }
  return { comment, held: comment.status !== 'PUBLISHED' };
}

export async function listTopics() {
  return prisma.topic.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function listResources() {
  return prisma.supportResource.findMany({ orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] });
}
