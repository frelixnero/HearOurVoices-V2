import { handle } from '@/lib/http/route';
import { getCurrentUser } from '@/lib/auth/session';
import { startVerification } from '@/lib/identity/service';
import { ok, fail } from '@/lib/http/responses';

// Begin residency/identity verification to become a Verified Citizen (§6.3).
export const POST = handle(async () => {
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated', 'Sign in first.', 401);
  const started = await startVerification(user.id);
  return ok(started, { status: 201 });
});
