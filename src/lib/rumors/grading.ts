// Rumor accuracy grading (pure + unit-testable). Turns community votes (and an
// optional reviewer verdict) into an accuracy grade + a 0–100 score + a confidence
// level. Guiding rule: NOT ENOUGH INPUT → "Unverified", never a made-up verdict.
export type Grade = 'TRUE' | 'MOSTLY_TRUE' | 'MIXED' | 'UNVERIFIED' | 'MOSTLY_FALSE' | 'FALSE';
export type Confidence = 'reviewed' | 'high' | 'medium' | 'low' | 'insufficient';

export interface GradeInput {
  accurateVotes: number;
  inaccurateVotes: number;
  officialGrade?: Grade | null;
}
export interface GradeResult {
  grade: Grade;
  score: number | null; // 0–100 accuracy, or null when unverified
  confidence: Confidence;
  totalVotes: number;
  source: 'reviewer' | 'community' | 'none';
  label: string; // human-friendly
}

// Need at least this many votes before the crowd renders a verdict.
const MIN_VOTES = 5;

const LABELS: Record<Grade, string> = {
  TRUE: 'Accurate',
  MOSTLY_TRUE: 'Mostly accurate',
  MIXED: 'Mixed',
  UNVERIFIED: 'Unverified',
  MOSTLY_FALSE: 'Mostly inaccurate',
  FALSE: 'Inaccurate',
};

function gradeFromScore(score: number): Grade {
  if (score >= 0.8) return 'TRUE';
  if (score >= 0.6) return 'MOSTLY_TRUE';
  if (score >= 0.4) return 'MIXED';
  if (score >= 0.2) return 'MOSTLY_FALSE';
  return 'FALSE';
}

export function gradeRumor(input: GradeInput): GradeResult {
  const total = input.accurateVotes + input.inaccurateVotes;

  // A reviewer verdict overrides the crowd.
  if (input.officialGrade) {
    const score = input.officialGrade === 'UNVERIFIED' ? null : scoreForGrade(input.officialGrade);
    return {
      grade: input.officialGrade, score, confidence: 'reviewed',
      totalVotes: total, source: 'reviewer', label: LABELS[input.officialGrade],
    };
  }

  // Not enough community input yet → Unverified (missing data is not a verdict).
  if (total < MIN_VOTES) {
    return {
      grade: 'UNVERIFIED', score: null, confidence: 'insufficient',
      totalVotes: total, source: 'none', label: LABELS.UNVERIFIED,
    };
  }

  const ratio = input.accurateVotes / total;
  const grade = gradeFromScore(ratio);
  const confidence: Confidence = total >= 40 ? 'high' : total >= 15 ? 'medium' : 'low';
  return {
    grade, score: Math.round(ratio * 100), confidence,
    totalVotes: total, source: 'community', label: LABELS[grade],
  };
}

// Representative score for a named grade (used when a reviewer sets the verdict).
function scoreForGrade(g: Grade): number {
  switch (g) {
    case 'TRUE': return 95;
    case 'MOSTLY_TRUE': return 72;
    case 'MIXED': return 50;
    case 'MOSTLY_FALSE': return 28;
    case 'FALSE': return 5;
    default: return 50;
  }
}

// Accent color per grade (used by badges + meter).
export const GRADE_COLOR: Record<Grade, string> = {
  TRUE: '#1c9d5b',
  MOSTLY_TRUE: '#5bbf6a',
  MIXED: '#d9a334',
  UNVERIFIED: '#8b96ab',
  MOSTLY_FALSE: '#e0752f',
  FALSE: '#e63329',
};
