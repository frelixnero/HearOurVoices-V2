import { prisma } from '@/lib/db/client';
import { hashPassword } from '@/lib/auth/crypto';
import { checkPasswordStrength } from '@/lib/auth/password-policy';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { registerSchema } from '@/lib/validation/auth';
import { handle, clientIp } from '@/lib/http/route';
import { hashIp } from '@/lib/auth/crypto';
import { rateLimit } from '@/lib/http/rate-limit';
import { writeAudit } from '@/lib/audit/audit';
import { ok, fail, ApiError } from '@/lib/http/responses';

export const POST = handle(async (req) => {
  const ip = clientIp(req);
  const rl = rateLimit(`register:${hashIp(ip) ?? 'anon'}`, { limit: 5, windowMs: 60_000 });
  if (!rl.allowed) return fail('rate_limited', 'Too many attempts. Try again shortly.', 429);

  const body = registerSchema.parse(await req.json());

  const strength = checkPasswordStrength(body.password);
  if (!strength.ok) throw new ApiError('validation_error', 'Weak password.', strength.errors);

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    // Do not reveal whether an email exists beyond a generic conflict (privacy §33).
    return fail('conflict', 'Could not create the account.', 409);
  }

  const user = await prisma.user.create({
    data: {
      email: body.email,
      displayName: body.displayName,
      passwordHash: await hashPassword(body.password),
      status: 'PENDING', // becomes ACTIVE after email verification (§22.2)
      locale: body.locale ?? 'en-US',
      timezone: body.timezone ?? 'America/Chicago',
      profile: { create: {} },
    },
  });

  // New accounts start as REGISTERED_CITIZEN (§6.2). Verified/elevated roles are
  // granted later through explicit, audited flows.
  const registered = await prisma.role.findUnique({ where: { name: 'REGISTERED_CITIZEN' } });
  if (registered) {
    await prisma.userRole.create({ data: { userId: user.id, roleId: registered.id } });
  }

  await writeAudit({
    actorUserId: user.id,
    action: 'user.registered',
    entityType: 'user',
    entityId: user.id,
    after: { email: user.email },
    ipHash: hashIp(ip),
  });

  const session = await createSession({ userId: user.id, ip });
  setSessionCookie(session.token, session.expiresAt);

  return ok(
    { id: user.id, email: user.email, displayName: user.displayName, status: user.status },
    { status: 201 },
  );
});
