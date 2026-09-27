import { handle } from '@/lib/http/route';
import { tributeSchema } from '@/lib/validation/honor';
import { addTribute } from '@/lib/honor/service';
import { ok } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';

// Public: leave a tribute. Held for moderation before it appears on the wall.
export const POST = handle(async (req: Request, ctx: { params: { id: string } }) => {
  const body = tributeSchema.parse(await req.json());
  const id = await addTribute({ heroId: ctx.params.id, ...body });
  return ok({ id, held: true }, { status: 201 });
});
