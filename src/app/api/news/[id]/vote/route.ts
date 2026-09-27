import { handle } from '@/lib/http/route';
import { getCurrentUser } from '@/lib/auth/session';
import { voteNewsSchema } from '@/lib/validation/civic';
import { voteNews } from '@/lib/civic/service';
import { ok, fail } from '@/lib/http/responses';

// Cast your public judgment (Good/Bad/Needs Info) — a reason is required.
export const POST = handle(async (req: Request, ctx: { params: { id: string } }) => {
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated', 'Sign in to add your judgment.', 401);
  const body = voteNewsSchema.parse(await req.json());
  const result = await voteNews(ctx.params.id, user.id, body.verdict, body.reason);
  return ok(result);
});
