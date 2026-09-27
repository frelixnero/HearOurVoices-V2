// Follows + notifications (spec §26). Following a target subscribes a user; when a
// relevant event happens, notifyFollowers fans out notifications.
import { prisma } from '@/lib/db/client';

export async function follow(input: { userId: string; targetType: string; targetId: string }) {
  return prisma.follow.upsert({
    where: {
      userId_targetType_targetId: {
        userId: input.userId,
        targetType: input.targetType,
        targetId: input.targetId,
      },
    },
    update: {},
    create: input,
  });
}

export async function unfollow(input: { userId: string; targetType: string; targetId: string }) {
  await prisma.follow.deleteMany({ where: input });
}

/** Fan out a notification to everyone following a target. Returns count sent. */
export async function notifyFollowers(input: {
  targetType: string;
  targetId: string;
  type: string;
  title: string;
  body?: string;
  linkPath?: string;
}): Promise<number> {
  const followers = await prisma.follow.findMany({
    where: { targetType: input.targetType, targetId: input.targetId },
    select: { userId: true },
  });
  if (followers.length === 0) return 0;
  await prisma.notification.createMany({
    data: followers.map((f) => ({
      userId: f.userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      linkPath: input.linkPath ?? null,
    })),
  });
  return followers.length;
}

export async function listNotifications(userId: string, opts: { unreadOnly?: boolean } = {}) {
  return prisma.notification.findMany({
    where: { userId, ...(opts.unreadOnly ? { readAt: null } : {}) },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function markRead(userId: string, notificationId: string) {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  });
}
