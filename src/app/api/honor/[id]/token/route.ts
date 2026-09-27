import { handle } from '@/lib/http/route';
import { tokenSchema } from '@/lib/validation/honor';
import { leaveToken } from '@/lib/honor/service';
import { ok } from '@/lib/http/responses';
import type { TokenKey } from '@/lib/honor/labels';

export const dynamic = 'force-dynamic';

// Public remembrance gesture — leave a candle, coin, flag, stone, or flowers.
// Tokens accumulate at the resting place; no account needed.
export const POST = handle(async (req: Request, ctx: { params: { id: string } }) => {
  const { type } = tokenSchema.parse(await req.json());
  const counts = await leaveToken(ctx.params.id, type as TokenKey);
  return ok({ counts });
});
