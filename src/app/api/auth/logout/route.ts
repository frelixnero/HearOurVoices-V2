import { revokeCurrentSession } from '@/lib/auth/session';
import { handle } from '@/lib/http/route';
import { ok } from '@/lib/http/responses';

export const POST = handle(async () => {
  await revokeCurrentSession();
  return ok({ loggedOut: true });
});
