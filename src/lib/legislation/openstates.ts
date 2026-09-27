// Thin client for the OpenStates v3 API (https://v3.openstates.org).
// Public-record legislative data only. The API key lives in OPENSTATES_API_KEY
// and is NEVER exposed to the client — all calls run server-side.

const BASE = 'https://v3.openstates.org';

export const openStatesEnabled = (): boolean => !!process.env.OPENSTATES_API_KEY;

// Shapes we consume (a subset of the OpenStates Bill schema).
export interface OsSponsor { name: string; classification?: string; primary?: boolean }
export interface OsAction { date?: string; description?: string; classification?: string[] }
export interface OsVoteCount { option: string; value: number }
export interface OsVote { start_date?: string; motion_text?: string; result?: string; counts?: OsVoteCount[] }
export interface OsSource { url: string; note?: string }
export interface OsBill {
  id: string;
  identifier: string;
  title: string;
  classification?: string[];
  subject?: string[];
  session?: string;
  jurisdiction?: { name?: string } | null;
  openstates_url?: string;
  latest_action_date?: string;
  latest_action_description?: string;
  sponsorships?: OsSponsor[];
  actions?: OsAction[];
  votes?: OsVote[];
  sources?: OsSource[];
}
interface OsBillsResponse { results: OsBill[]; pagination?: { max_page?: number; total_items?: number } }

class OpenStatesError extends Error {}

async function get<T>(path: string, params: Record<string, string | string[] | number | undefined>): Promise<T> {
  const key = process.env.OPENSTATES_API_KEY;
  if (!key) throw new OpenStatesError('OPENSTATES_API_KEY is not set.');
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) v.forEach((item) => url.searchParams.append(k, String(item)));
    else url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), {
    headers: { 'x-api-key': key, accept: 'application/json' },
    // Never cache secrets/results at the fetch layer; we cache in our own DB.
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new OpenStatesError(`OpenStates ${path} ${res.status}: ${body.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

const INCLUDES = ['sponsorships', 'actions', 'votes', 'sources'];

/** List recent bills for a jurisdiction (state name, "United States", or OCD id). */
export async function fetchBills(jurisdiction: string, opts: { perPage?: number; page?: number } = {}): Promise<OsBill[]> {
  const data = await get<OsBillsResponse>('/bills', {
    jurisdiction,
    sort: 'latest_action_desc',
    per_page: Math.min(opts.perPage ?? 20, 50),
    page: opts.page ?? 1,
    include: INCLUDES,
  });
  return data.results ?? [];
}
