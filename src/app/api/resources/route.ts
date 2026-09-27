import { handle } from '@/lib/http/route';
import { listResources } from '@/lib/stories/service';
import { ok } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => ok(await listResources()));
