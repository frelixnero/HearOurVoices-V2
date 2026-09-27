// Display metadata + reason bank + tally logic for Civic News / Public Judgment.
// The verdict is always the PUBLIC's, shown as percentages — the platform never
// asserts Good/Bad itself.

export const SCOPES = ['LOCAL', 'STATE', 'NATION'] as const;
export type CivicScope = (typeof SCOPES)[number];
export const SCOPE_META: Record<CivicScope, { text: string; color: string }> = {
  LOCAL: { text: 'Local', color: '#3a8fd6' },
  STATE: { text: 'State', color: '#7f6bd6' },
  NATION: { text: 'Nation', color: '#0d9488' },
};

export const VERDICTS = ['GOOD_MOVE', 'BAD_MOVE', 'NEEDS_INFO'] as const;
export type CivicVerdict = (typeof VERDICTS)[number];
export const VERDICT_META: Record<CivicVerdict, { text: string; color: string; emoji: string }> = {
  GOOD_MOVE: { text: 'Good Move', color: '#1c9d5b', emoji: '🔵' },
  BAD_MOVE: { text: 'Bad Move', color: '#e63329', emoji: '🔴' },
  NEEDS_INFO: { text: 'Needs Info', color: '#8b96ab', emoji: '⚪' },
};

// One engine, every authority — the category only changes which evidence to pull.
export const AUTHORITIES = [
  'POLICE', 'LAWMAKER', 'JUDGE', 'COUNCIL', 'AGENCY', 'COMMITTEE', 'OVERSIGHT', 'EXECUTIVE', 'OTHER',
] as const;
export type AuthorityCategory = (typeof AUTHORITIES)[number];
export const AUTHORITY_META: Record<AuthorityCategory, { text: string; evidence: string }> = {
  POLICE: { text: 'Police', evidence: 'bodycam · incident reports · dispatch logs · use-of-force policy · witnesses' },
  LAWMAKER: { text: 'Lawmaker', evidence: 'bill text · amendments · vote records · committee minutes · public notice' },
  JUDGE: { text: 'Judge / Court', evidence: 'ruling text · precedent · evidence handling · conflicts · appeal chain' },
  COUNCIL: { text: 'City / County Council', evidence: 'meeting recordings · agenda changes · public comment · budget impact' },
  AGENCY: { text: 'Agency', evidence: 'rulemaking documents · data · timelines · oversight authority' },
  COMMITTEE: { text: 'Committee', evidence: 'roll-call votes · bill text · hearing records · public comment window' },
  OVERSIGHT: { text: 'Oversight board', evidence: 'findings · complaints · disciplinary records · authority scope' },
  EXECUTIVE: { text: 'Executive (Mayor/Gov/President)', evidence: 'orders · signing statements · veto record · public statements' },
  OTHER: { text: 'Other authority', evidence: 'primary documents · recordings · official statements' },
};

export const EVIDENCE_LABELS = ['DOCUMENTED', 'RECORDED', 'MISSING', 'UNVERIFIED'] as const;
export type EvidenceLabel = (typeof EVIDENCE_LABELS)[number];
export const EVIDENCE_META: Record<EvidenceLabel, { text: string; color: string }> = {
  DOCUMENTED: { text: 'Documented', color: '#1c9d5b' },
  RECORDED: { text: 'Recorded', color: '#3a8fd6' },
  MISSING: { text: 'Missing evidence', color: '#e0752f' },
  UNVERIFIED: { text: 'Unverified', color: '#d9a334' },
};

// Reasons a voter must pick from (or write their own) — forces thinking.
export const VOTE_REASONS = [
  'Process was followed correctly.',
  'They hid information.',
  'This helps the community.',
  'This harms the community.',
  'Evidence is missing.',
  'This feels rushed.',
  'This seems fair.',
  'This seems unfair.',
  'No recorded vote.',
  'Changed at the last minute.',
  'I need more details.',
] as const;

// The six process-check questions (factual, from the record).
export const PROCESS_CHECKS: { key: string; label: string }[] = [
  { key: 'recordedVote', label: 'Was there a recorded vote?' },
  { key: 'publicNotice', label: 'Was public notice given?' },
  { key: 'amendmentPosted', label: 'Was any amendment posted in advance?' },
  { key: 'meetingRecorded', label: 'Was the meeting recorded?' },
  { key: 'publicComment', label: 'Was public comment allowed?' },
  { key: 'procedureLegal', label: 'Did it follow the required procedure?' },
];

// ── Red Flags ──────────────────────────────────────────────────────────────
// Transparency patterns to watch for. These describe ACTIONS/PROCESS, never a
// person. Auto-detected flags fire ONLY from the documented record (an explicit
// "no"), never from "unknown" — so a flag always maps to a sourced fact.
export interface RedFlag { key: string; icon: string; title: string; why: string }

const PROCESS_RED_FLAGS: (RedFlag & { field: string })[] = [
  { field: 'recordedVote', key: 'unrecorded_vote', icon: '🚩', title: 'No recorded vote', why: 'Without a recorded (roll-call) vote, no individual is accountable for how they voted.' },
  { field: 'publicNotice', key: 'no_public_notice', icon: '🚩', title: 'No public notice', why: 'Little or no advance notice limits the public’s chance to weigh in before a decision.' },
  { field: 'amendmentPosted', key: 'unposted_amendment', icon: '🚩', title: 'Last-minute amendment', why: 'An amendment not posted in advance can change a measure without public review.' },
  { field: 'meetingRecorded', key: 'no_recording', icon: '🚩', title: 'Meeting not recorded', why: 'No recording means no independent record of what was said and decided.' },
  { field: 'publicComment', key: 'no_public_comment', icon: '🚩', title: 'No public comment', why: 'Skipping public comment removes the community’s voice from the process.' },
  { field: 'procedureLegal', key: 'rules_bypassed', icon: '🚩', title: 'Normal procedure not followed', why: 'Suspending the rules or skipping required steps reduces the usual checks on a decision.' },
];

/** Red flags the RECORD raises for a civic item, from its documented process fields. */
export function detectRedFlags(p: Record<string, boolean | null | undefined>): RedFlag[] {
  return PROCESS_RED_FLAGS.filter((f) => p[f.field] === false).map(({ field: _field, ...rest }) => rest);
}

/** Full "patterns to watch" catalog for the education page (a superset — some are
 *  not auto-detected because the platform doesn't yet capture that field). */
export const RED_FLAG_PATTERNS: RedFlag[] = [
  { key: 'last_minute_amendments', icon: '🚩', title: 'Last-minute amendments', why: 'Unrelated or major items added right before a vote, with no time for public review.' },
  { key: 'emergency_meetings', icon: '🚩', title: '“Emergency” meetings', why: 'Sessions called on short notice can pass rules with little public attendance.' },
  { key: 'midnight_votes', icon: '🚩', title: 'Midnight votes', why: 'Late-night votes reduce public scrutiny.' },
  { key: 'vague_agenda', icon: '🚩', title: 'Vague agenda items', why: 'A generic label like “administrative update” can hide a major policy change.' },
  { key: 'giant_bills', icon: '🚩', title: '200+ page bills', why: 'Very long bills can bury controversial sections deep inside.' },
  { key: 'missing_fiscal_note', icon: '🚩', title: 'Fiscal note unavailable', why: 'Passing something without showing its cost hides the price from the public.' },
  { key: 'suspending_rules', icon: '🚩', title: 'Suspending the rules', why: 'Skipping normal procedure removes the usual safeguards.' },
  { key: 'unrecorded_voice_vote', icon: '🚩', title: 'Unrecorded voice vote', why: 'A voice vote leaves no names attached — no individual accountability.' },
];

export const IMPACT_META = [
  'No public effect', 'Minor inconvenience', 'Noticeable change',
  'Significant community impact', 'Major rights/safety/financial impact',
  'City-wide or life-changing impact',
];

export interface Judgment {
  good: number; bad: number; info: number; total: number;
  goodPct: number; badPct: number; infoPct: number;
  leader: CivicVerdict | null; // majority verdict, or null if no votes
}

export function judge(good: number, bad: number, info: number): Judgment {
  const total = good + bad + info;
  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));
  let leader: CivicVerdict | null = null;
  if (total > 0) {
    leader = good >= bad && good >= info ? 'GOOD_MOVE' : bad >= info ? 'BAD_MOVE' : 'NEEDS_INFO';
  }
  return { good, bad, info, total, goodPct: pct(good), badPct: pct(bad), infoPct: pct(info), leader };
}

// Plain-language "God-Tier" news modules. actionType picks the module label and a
// default "what happens next" hint (editable per story). Kept neutral and factual.
export const ACTION_TYPES = [
  'congress_debate', 'cabinet_appointment', 'committee_hearing',
  'agency_action', 'town_meeting', 'city_council', 'other',
] as const;
export type ActionType = (typeof ACTION_TYPES)[number];

export const ACTION_META: Record<ActionType, { label: string; icon: string; blurb: string; nextHint: string }> = {
  congress_debate:     { label: 'Congress Debate',      icon: '🏛️', blurb: 'Lawmakers are debating a rule or bill.',            nextHint: 'Next, Congress votes — or sends it to committee.' },
  cabinet_appointment: { label: 'Cabinet Appointment',  icon: '🧑‍💼', blurb: 'The President picked someone to run part of the government.', nextHint: 'Next, the Senate votes to approve or reject.' },
  committee_hearing:   { label: 'Committee Hearing',    icon: '📋', blurb: 'A committee is checking how a rule works.',           nextHint: 'Next, the committee writes a report.' },
  agency_action:       { label: 'Agency Action',        icon: '🏢', blurb: 'A government agency made or changed a rule.',        nextHint: 'Next, people can send comments before it becomes final.' },
  town_meeting:        { label: 'Town Meeting',         icon: '🏘️', blurb: 'A town met to decide something local.',              nextHint: 'Next, the council votes.' },
  city_council:        { label: 'City Council',         icon: '🏙️', blurb: 'The city is deciding on a local action.',            nextHint: 'Next, the council votes.' },
  other:               { label: 'Government Action',    icon: '📣', blurb: 'A public body took an action.',                      nextHint: 'Next steps depend on the process.' },
};
