import { handle, clientIp } from '@/lib/http/route';
import { hashIp } from '@/lib/auth/crypto';
import { requirePermission } from '@/lib/permissions/guard';
import { listNotifications } from '@/lib/notifications/service';
import { ok } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';

// The signed-in user's notifications (§26).
export const GET = handle(async (req) => {
  const user = await requirePermission('follow.manage', {
    entityType: 'notification',
    ipHash: hashIp(clientIp(req)),
  });
  const unreadOnly = new URL(req.url).searchParams.get('unread') === '1';
  const items = await listNotifications(user.id, { unreadOnly });
  return ok(items);
});
