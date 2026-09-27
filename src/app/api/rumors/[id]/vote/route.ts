import { handle } from '@/lib/http/route';
import { getCurrentUser } from '@/lib/auth/session';
import { voteRumorSchema } from '@/lib/validation/rumors';
import { voteRumor } from '@/lib/rumors/service';
import { ok, fail } from '@/lib/http/responses';
import { rumorsEnabled } from '@/lib/flags';

// Vote a rumor accurate/inaccurate (one per user; voting the same way again
// retracts it). Returns the recomputed grade.
export const POST = handle(async (req: Request, ctx: { params: { id: string } }) => {
  if (!rumorsEnabled()) return fail('not_found', 'Not found.', 404);
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated', 'Sign in to help grade this rumor.', 401);
  const { vote } = voteRumorSchema.parse(await req.json());
  const result = await voteRumor(ctx.params.id, user.id, vote);
  return ok(result);
});
