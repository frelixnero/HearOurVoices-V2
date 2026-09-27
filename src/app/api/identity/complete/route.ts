import { z } from 'zod';
import { handle } from '@/lib/http/route';
import { getCurrentUser } from '@/lib/auth/session';
import { completeVerification } from '@/lib/identity/service';
import { ok, fail } from '@/lib/http/responses';

const schema = z.object({ verificationId: z.string().min(1).max(60) });

// Finish verification. On approval the user becomes a Verified Citizen and can
// submit claims, upload evidence, and sign petitions (§6.3).
export const POST = handle(async (req) => {
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated', 'Sign in first.', 401);
  const { verificationId } = schema.parse(await req.json());
  const result = await completeVerification(user.id, verificationId);
  return ok(result);
});
