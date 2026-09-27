import { prisma } from '@/lib/db/client';
import { handle } from '@/lib/http/route';
import { getCurrentUser } from '@/lib/auth/session';
import { generateSecret, otpauthUri } from '@/lib/auth/totp';
import { ok, fail } from '@/lib/http/responses';

// Begin MFA enrollment: generate a secret, store it as pending (not yet enabled),
// and return the otpauth URI the user scans into their authenticator app.
export const POST = handle(async () => {
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated', 'Sign in first.', 401);

  const secret = generateSecret();
  // Store the pending secret prefixed so getCurrentUser().mfaEnabled stays false
  // until the user confirms a code (mfaEnabled = secret exists AND is confirmed).
  await prisma.user.update({
    where: { id: user.id },
    data: { mfaSecret: `pending:${secret}` },
  });
  return ok({ secret, otpauthUri: otpauthUri(secret, user.email) });
});
