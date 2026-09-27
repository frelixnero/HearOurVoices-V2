import { handle } from '@/lib/http/route';
import { getCurrentUser } from '@/lib/auth/session';
import { rateLimit } from '@/lib/http/rate-limit';
import { submitRumorSchema } from '@/lib/validation/rumors';
import { submitRumor, listRumors } from '@/lib/rumors/service';
import { ok, fail, paginated } from '@/lib/http/responses';
import { rumorsEnabled } from '@/lib/flags';

export const dynamic = 'force-dynamic';

// Public list of open rumors with their current accuracy grade.
export const GET = handle(async (req) => {
  if (!rumorsEnabled()) return fail('not_found', 'Not found.', 404);
  const url = new URL(req.url);
  const { items, nextCursor } = await listRumors({
    topic: url.searchParams.get('topic') ?? undefined,
    cursor: url.searchParams.get('cursor'),
  });
  const shaped = items.map((r) => ({
    id: r.id, displayName: r.displayName, text: r.text, topic: r.topic,
    createdAt: r.createdAt, grading: r.grading,
  }));
  return paginated(shaped, { nextCursor });
});

// Post a rumor (signed-in). Starts UNVERIFIED until the community weighs in.
export const POST = handle(async (req) => {
  if (!rumorsEnabled()) return fail('not_found', 'Not found.', 404);
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated', 'Please sign in to post a rumor.', 401);
  const rl = rateLimit(`rumor:${user.id}`, { limit: 8, windowMs: 60_000 });
  if (!rl.allowed) return fail('rate_limited', 'You’re posting quickly — try again shortly.', 429);

  const body = submitRumorSchema.parse(await req.json());
  const { rumor, held } = await submitRumor({
    submitterUserId: user.id,
    displayName: user.displayName,
    anonymous: body.anonymous,
    text: body.text,
    topic: body.topic,
  });
  return ok({
    id: rumor.id, held,
    message: held
      ? 'Thanks — this will be reviewed for safety before it appears.'
      : 'Posted. It starts as “Unverified” — the community will help grade it.',
  }, { status: 201 });
});
