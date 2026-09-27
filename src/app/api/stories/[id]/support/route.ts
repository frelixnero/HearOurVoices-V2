import { handle } from '@/lib/http/route';
import { getCurrentUser } from '@/lib/auth/session';
import { toggleSupport } from '@/lib/stories/service';
import { ok, fail } from '@/lib/http/responses';

// Toggle "support" (a heart) on a story. One per user (deduped).
export const POST = handle(async (_req: Request, ctx: { params: { id: string } }) => {
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated', 'Sign in to support this story.', 401);
  const result = await toggleSupport(ctx.params.id, user.id);
  return ok(result);
});
