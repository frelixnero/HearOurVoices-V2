// AI draft-assist for the plain-language news engine. Turns raw government text
// (a bill, meeting record, press release) into a 5th-grade breakdown for a
// moderator to REVIEW and edit — never auto-published. Gated on XAI_API_KEY.
import { ACTION_META, type ActionType } from './labels';

const BASE = process.env.XAI_BASE_URL || 'https://api.x.ai/v1';
const MODEL = process.env.XAI_MODEL || 'grok-4.5';

export const newsDraftEnabled = (): boolean => !!process.env.XAI_API_KEY;

export interface NewsDraft {
  title: string;
  whatHappened: string;
  whyItMatters: string;
  pros: string[];
  cons: string[];
  nextStep: string;
}

const SYSTEM = [
  'You help a neutral civic-transparency newsroom rewrite government actions in plain language for everyone.',
  'Write at a 5th-grade reading level. Short sentences. No jargon. No party names. No spin. No predictions.',
  'Only use facts present in the provided text — do not invent details. If something is unknown, leave it out.',
  'PROS are neutral reasons SOME people support it. CONS are neutral reasons SOME people are worried.',
  'State them as "reasons people give", never as the newsroom\'s own opinion.',
  'nextStep = the next step in the process (a vote, a committee, a signature, a comment window).',
  'Respond with ONLY this JSON: {"title":string,"whatHappened":string,"whyItMatters":string,"pros":[string],"cons":[string],"nextStep":string}.',
  'title <= 90 chars. whatHappened/whyItMatters 2-3 short sentences each. 2-4 pros and cons. nextStep one sentence.',
].join(' ');

function extractJson(text: string): Record<string, unknown> | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1]! : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(candidate.slice(start, end + 1)); } catch { return null; }
}

const clampList = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean).slice(0, 4).map((s) => s.slice(0, 300)) : [];

/** Draft a plain-language breakdown from raw text. Human reviews before publish. */
export async function draftBreakdown(rawText: string, actionType?: ActionType): Promise<NewsDraft> {
  const key = process.env.XAI_API_KEY;
  if (!key) throw new Error('XAI_API_KEY is not set.');

  const hint = actionType ? `\nThis is a ${ACTION_META[actionType].label}. A typical next step: ${ACTION_META[actionType].nextHint}` : '';
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    cache: 'no-store',
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: `Rewrite this government action as a plain-language breakdown:${hint}\n\n${rawText.slice(0, 12000)}` },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`xAI ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const parsed = extractJson(data.choices?.[0]?.message?.content ?? '');
  if (!parsed) throw new Error('Could not parse a draft from the AI response.');
  return {
    title: String(parsed.title ?? '').trim().slice(0, 200),
    whatHappened: String(parsed.whatHappened ?? '').trim().slice(0, 6000),
    whyItMatters: String(parsed.whyItMatters ?? '').trim().slice(0, 3000),
    pros: clampList(parsed.pros),
    cons: clampList(parsed.cons),
    nextStep: String(parsed.nextStep ?? '').trim().slice(0, 600),
  };
}
