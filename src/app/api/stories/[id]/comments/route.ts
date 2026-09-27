import { handle } from '@/lib/http/route';
import { getCurrentUser } from '@/lib/auth/session';
import { commentSchema } from '@/lib/validation/stories';
import { addComment } from '@/lib/stories/service';
import { ok, fail } from '@/lib/http/responses';

// Leave a supportive comment. Runs the same safety screen as stories.
export const POST = handle(async (req: Request, ctx: { params: { id: string } }) => {
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated', 'Sign in to leave a supportive comment.', 401);
  const body = commentSchema.parse(await req.json());
  const { comment, held } = await addComment({
    storyId: ctx.params.id,
    authorUserId: user.id,
    displayName: user.displayName,
    anonymous: body.anonymous,
    body: body.body,
  });
  return ok({ id: comment.id, held }, { status: 201 });
});
