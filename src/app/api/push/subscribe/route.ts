import { z } from 'zod';
import { handle } from '@/lib/http/route';
import { saveSubscription, removeSubscription, pushEnabled } from '@/lib/push/service';
import { ok, ApiError } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';

const subSchema = z.object({
  endpoint: z.string().url().max(1000),
  keys: z.object({ p256dh: z.string().max(300), auth: z.string().max(300) }),
});

// Opt in to push alerts. Anonymous — identified only by the push endpoint.
export const POST = handle(async (req: Request) => {
  if (!pushEnabled()) throw new ApiError('conflict', 'Alerts aren’t enabled yet.');
  const sub = subSchema.parse(await req.json());
  await saveSubscription(sub);
  return ok({ subscribed: true }, { status: 201 });
});

// Opt out.
export const DELETE = handle(async (req: Request) => {
  const { endpoint } = z.object({ endpoint: z.string().url().max(1000) }).parse(await req.json());
  await removeSubscription(endpoint);
  return ok({ unsubscribed: true });
});
