// Client for xAI Grok Live Search (https://docs.x.ai). Used to surface UNVERIFIED
// research leads from X / news / web for staff triage — never for auto-publishing.
// Endpoint + model are env-configurable so this survives xAI API changes.

const BASE = process.env.XAI_BASE_URL || 'https://api.x.ai/v1';
const MODEL = process.env.XAI_MODEL || 'grok-4.5';

export const xaiEnabled = (): boolean => !!process.env.XAI_API_KEY;

export interface LeadCitation { url: string; title?: string }
export interface DiscoveredLead { title: string; summary: string; citations: LeadCitation[] }

const SYSTEM = [
  'You surface civic-accountability LEADS for a newsroom to investigate. You are NOT publishing.',
  'Use live search over X, news, and the web. Every lead MUST be about a public action by an authority',
  '(a bill, vote, ruling, police/agency action, meeting, executive order, etc.) — not about private individuals.',
  'For each lead, write a neutral one–two sentence factual summary and include the real source URLs you used.',
  'Do NOT assert unproven claims as fact; describe what is being reported/discussed. If nothing solid, return an empty list.',
  'Respond with ONLY a JSON object: {"leads":[{"title":string,"summary":string,"sources":[string,...]}]} (max 6 leads).',
].join(' ');

interface XaiMessage { role: string; content: string }
interface XaiResponse {
  choices?: { message?: { content?: string } }[];
  citations?: string[];
  // Some API variants nest search results differently; we read defensively.
}

function extractJson(text: string): { leads?: { title?: string; summary?: string; sources?: string[] }[] } | null {
  // Model may wrap JSON in prose or code fences; grab the first {...} block.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1]! : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(candidate.slice(start, end + 1)); } catch { return null; }
}

/** Query Grok Live Search and return structured, source-cited leads. */
export async function discoverLeads(query: string, jurisdiction?: string): Promise<DiscoveredLead[]> {
  const key = process.env.XAI_API_KEY;
  if (!key) throw new Error('XAI_API_KEY is not set.');
  const userPrompt = `Find recent civic-accountability leads about: ${query}${jurisdiction ? ` (jurisdiction: ${jurisdiction})` : ''}.`;
  const messages: XaiMessage[] = [
    { role: 'system', content: SYSTEM },
    { role: 'user', content: userPrompt },
  ];

  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    cache: 'no-store',
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.2,
      // Live Search: ground the answer in real X / news / web results with citations.
      search_parameters: {
        mode: 'on',
        return_citations: true,
        max_search_results: 15,
        sources: [{ type: 'x' }, { type: 'news' }, { type: 'web' }],
      },
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`xAI ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as XaiResponse;
  const content = data.choices?.[0]?.message?.content ?? '';
  const parsed = extractJson(content);
  const globalCites = (data.citations ?? []).map((url) => ({ url }));

  const leads = (parsed?.leads ?? []).flatMap((l) => {
    const title = (l.title ?? '').trim();
    const summary = (l.summary ?? '').trim();
    if (!title || !summary) return [];
    const cites = (l.sources ?? []).filter(Boolean).map((url) => ({ url }));
    return [{ title: title.slice(0, 200), summary: summary.slice(0, 1200), citations: cites.length ? cites : globalCites }];
  });
  return leads.slice(0, 6);
}
