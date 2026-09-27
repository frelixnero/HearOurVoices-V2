import { z } from 'zod';
import { prisma } from '@/lib/db/client';
import { handle } from '@/lib/http/route';
import { getCurrentUser } from '@/lib/auth/session';
import { verifyToken } from '@/lib/auth/totp';
import { writeAudit } from '@/lib/audit/audit';
import { ok, fail } from '@/lib/http/responses';

const schema = z.object({ code: z.string().min(6).max(8) });

// Confirm enrollment: verify a 6-digit code against the pending secret. On
// success the secret is marked active and MFA becomes required-capable for the
// user (spec §32).
export const POST = handle(async (req) => {
  const user = await getCurrentUser();
  if (!user) return fail('unauthenticated', 'Sign in first.', 401);

  const { code } = schema.parse(await req.json());
  const record = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  const pending = record.mfaSecret;
  if (!pending || !pending.startsWith('pending:')) {
    return fail('conflict', 'Start MFA setup first.', 409);
  }
  const secret = pending.slice('pending:'.length);
  if (!verifyToken(secret, code)) {
    return fail('validation_error', 'That code is not correct. Try again.', 422);
  }
  await prisma.user.update({ where: { id: user.id }, data: { mfaSecret: secret } });
  await writeAudit({ actorUserId: user.id, action: 'mfa.enabled', entityType: 'user', entityId: user.id });
  return ok({ mfaEnabled: true });
});
