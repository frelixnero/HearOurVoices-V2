import { handle, clientIp } from '@/lib/http/route';
import { hashIp } from '@/lib/auth/crypto';
import { getCurrentUser } from '@/lib/auth/session';
import { rateLimit } from '@/lib/http/rate-limit';
import { submitStorySchema } from '@/lib/validation/stories';
import { submitStory, listStories } from '@/lib/stories/service';
import { ok, fail, paginated } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';

// Public feed of published stories, filterable by topic (cursor paginated).
export const GET = handle(async (req) => {
  const url = new URL(req.url);
  const { items, nextCursor } = await listStories({
    topic: url.searchParams.get('topic') ?? undefined,
    cursor: url.searchParams.get('cursor'),
  });
  const shaped = items.map((s) => ({
    id: s.id, displayName: s.displayName, title: s.title, body: s.body,
    topics: s.topics, supportCount: s.supportCount, commentCount: s.commentCount,
    createdAt: s.createdAt,
  }));
  return paginated(shaped, { nextCursor });
});

// Share a story. Requires a signed-in account (prevents abuse); the account can
// choose to display anonymously. Runs the safety screen (§ Safe & Moderated).
export const POST = handle(async (req) => {
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated', 'Please sign in to share your story.', 401);

  const rl = rateLimit(`story:${user.id}`, { limit: 8, windowMs: 60_000 });
  if (!rl.allowed) return fail('rate_limited', 'You’re posting quickly — take a breath and try again shortly.', 429);

  const body = submitStorySchema.parse(await req.json());
  const result = await submitStory({
    authorUserId: user.id,
    displayName: user.displayName,
    anonymous: body.anonymous,
    title: body.title,
    body: body.body,
    topics: body.topics,
    hideLocation: body.hideLocation,
  });

  return ok(
    {
      id: result.story.id,
      status: result.story.status,
      held: result.held,
      crisis: result.crisis, // client surfaces support resources when true
      message: result.held
        ? 'Thank you for sharing. Our team will review this shortly before it appears.'
        : 'Your story is live. Thank you for your courage.',
    },
    { status: 201 },
  );
});
