import { handle } from '@/lib/http/route';
import { search } from '@/lib/search/service';
import { ok } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';

// Public search across jurisdictions, officials, agencies, and PUBLISHED claims
// (§27). Restricted content never appears in results.
export const GET = handle(async (req) => {
  const q = new URL(req.url).searchParams.get('q') ?? '';
  const hits = await search(q);
  return ok(hits);
});
