// Justice Vault display metadata + the JSON shapes + score/spotlight logic.

export const CASE_STATUSES = ['ACTIVE', 'UNDER_REVIEW', 'HISTORICAL'] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];
export const CASE_STATUS_META: Record<CaseStatus, { text: string; color: string }> = {
  ACTIVE: { text: 'Active', color: '#e63329' },
  UNDER_REVIEW: { text: 'Under review', color: '#d9a334' },
  HISTORICAL: { text: 'Historical', color: '#8b96ab' },
};

// Reuse the neutral action labels (Good/Bad/Needs Info) for authority actions.
export const SCORE_TAGS = ['GOOD_MOVE', 'BAD_MOVE', 'NEEDS_INFO'] as const;
export type ScoreTag = (typeof SCORE_TAGS)[number];
export const SCORE_META: Record<ScoreTag, { text: string; color: string; emoji: string }> = {
  GOOD_MOVE: { text: 'Good Move', color: '#1c9d5b', emoji: '🔵' },
  BAD_MOVE: { text: 'Bad Move', color: '#e63329', emoji: '🔴' },
  NEEDS_INFO: { text: 'Needs Info', color: '#8b96ab', emoji: '⚪' },
};

export const QUESTION_STATUSES = ['Unanswered', 'Partially Answered', 'Addressed'] as const;
export const TIMELINE_LABELS = [
  'Incident', 'Arrest', 'Booking', 'Charging', 'Initial appearance', 'Bail decision',
  'Discovery', 'Motions', 'Hearing', 'Trial', 'Verdict', 'Sentencing', 'Appeal',
  'Dismissal', 'Civil settlement', 'Misconduct finding', 'Records release', 'Aftermath',
] as const;

// JSON shapes
export interface TimelineEvent { date?: string; label: string; description: string; scoreTag?: ScoreTag; sourceUrl?: string }
export interface AuthorityAction { actorType: string; actorName?: string; description: string; scoreTag: ScoreTag; impactWeight?: number }
export interface OpenQuestion { questionText: string; targetAuthority: string; status: string }
export interface ContradictionFlag { flag: string; reason: string }
export interface CaseSource { label: 'DOCUMENTED' | 'RECORDED' | 'MISSING' | 'UNVERIFIED'; title: string; url?: string }

export const GAP_META = (score: number) =>
  score >= 80 ? { text: 'Very high justice gap', color: '#e63329' }
  : score >= 60 ? { text: 'High justice gap', color: '#e0752f' }
  : score >= 40 ? { text: 'Moderate justice gap', color: '#d9a334' }
  : score >= 20 ? { text: 'Some concerns', color: '#c9a227' }
  : { text: 'Low justice gap', color: '#1c9d5b' };

/**
 * Suggests a spotlight level (0–3) from the case. Level 3 ("never forget") needs
 * a very high gap score AND a contradiction AND several open questions.
 */
export function suggestSpotlight(input: { justiceGapScore: number; flagCount: number; openQuestionCount: number }): number {
  if (input.justiceGapScore >= 80 && input.flagCount >= 1 && input.openQuestionCount >= 3) return 3;
  if (input.justiceGapScore >= 60 && input.flagCount >= 1) return 2;
  if (input.justiceGapScore >= 40) return 1;
  return 0;
}
