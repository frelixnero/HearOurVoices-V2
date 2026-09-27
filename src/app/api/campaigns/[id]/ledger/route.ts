import { handle } from '@/lib/http/route';
import { getLedger } from '@/lib/civicfund/service';
import { ok } from '@/lib/http/responses';

// Public transparent ledger for a campaign (§16.5). No auth: financial
// transparency is a core promise.
export const GET = handle(async (_req: Request, ctx: { params: { id: string } }) => {
  const ledger = await getLedger(ctx.params.id);
  return ok(ledger);
});
