import { handle } from '@/lib/http/route';
import { listElections } from '@/lib/elections/service';
import { ok } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';

// Public list of elections (§18). No auth — this is core public information.
export const GET = handle(async () => ok(await listElections()));
