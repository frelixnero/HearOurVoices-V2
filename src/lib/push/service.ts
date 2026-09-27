// Web-push delivery. Sends red-flag / breaking-news alerts to opted-in devices.
// Gated on VAPID keys; a dead subscription (410/404) is pruned automatically.
import webpush from 'web-push';
import { prisma } from '@/lib/db/client';

export const pushEnabled = (): boolean =>
  !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

let configured = false;
function configure() {
  if (configured || !pushEnabled()) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:hello@hearourvoices.app',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
}

export async function saveSubscription(sub: { endpoint: string; keys: { p256dh: string; auth: string } }) {
  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    create: { endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    update: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
  });
}

export async function removeSubscription(endpoint: string) {
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
}

export interface PushPayload { title: string; body: string; url?: string; tag?: string }

/** Fan out a push to every subscriber. Prunes subscriptions that are gone. */
export async function sendPushToAll(payload: PushPayload): Promise<{ sent: number; pruned: number }> {
  if (!pushEnabled()) return { sent: 0, pruned: 0 };
  configure();
  const subs = await prisma.pushSubscription.findMany();
  const body = JSON.stringify(payload);
  let sent = 0; const dead: string[] = [];
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body);
      sent++;
    } catch (err: unknown) {
      const code = (err as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) dead.push(s.endpoint); // gone — prune
    }
  }));
  if (dead.length) await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: dead } } });
  return { sent, pruned: dead.length };
}
