import { describe, it, expect } from 'vitest';
import { computeScore } from '@/lib/scoring/score';

describe('Scorecard scoring — missing data is never zero (spec §10.5, §45 rule 10)', () => {
  it('excludes null metrics instead of treating them as zero', () => {
    const withMissing = computeScore([
      {
        name: 'Transparency',
        weight: 1,
        metrics: [
          { name: 'a', normalizedScore: 0.8, weight: 1, evidenceConfidence: 1 },
          { name: 'b', normalizedScore: null, weight: 1, evidenceConfidence: 1 }, // missing
        ],
      },
    ]);
    // If missing counted as 0 the score would be 0.4; excluding it yields 0.8.
    expect(withMissing.categories[0]?.score).toBeCloseTo(0.8, 5);
  });

  it('returns insufficientData (null overall) when a category has no data', () => {
    const r = computeScore([
      {
        name: 'Ethics',
        weight: 1,
        metrics: [{ name: 'a', normalizedScore: null, weight: 1, evidenceConfidence: 1 }],
      },
    ]);
    expect(r.categories[0]?.confidence).toBe('insufficient_data');
    expect(r.overallScore).toBeNull();
    expect(r.insufficientData).toBe(true);
  });

  it('returns insufficientData overall when too little category weight has data', () => {
    const r = computeScore([
      { name: 'A', weight: 3, metrics: [{ name: 'x', normalizedScore: null, weight: 1, evidenceConfidence: 1 }] },
      { name: 'B', weight: 1, metrics: [{ name: 'y', normalizedScore: 0.9, weight: 1, evidenceConfidence: 1 }] },
    ]);
    // Only 1 of 4 total category-weight has data (<50%) → insufficient.
    expect(r.insufficientData).toBe(true);
    expect(r.overallScore).toBeNull();
  });

  it('computes a weighted overall when enough data exists', () => {
    const r = computeScore([
      { name: 'A', weight: 1, metrics: [{ name: 'x', normalizedScore: 1.0, weight: 1, evidenceConfidence: 1 }] },
      { name: 'B', weight: 1, metrics: [{ name: 'y', normalizedScore: 0.5, weight: 1, evidenceConfidence: 1 }] },
    ]);
    expect(r.insufficientData).toBe(false);
    expect(r.overallScore).toBeCloseTo(0.75, 5);
  });

  it('applies evidence confidence to metric contribution', () => {
    const r = computeScore([
      {
        name: 'A',
        weight: 1,
        metrics: [
          { name: 'x', normalizedScore: 1.0, weight: 1, evidenceConfidence: 0.5 },
          { name: 'y', normalizedScore: 0.0, weight: 1, evidenceConfidence: 1.0 },
        ],
      },
    ]);
    // weightedSum = 1*1*0.5 + 0*1*1 = 0.5 ; activeWeight = 0.5 + 1 = 1.5 → 0.333
    expect(r.categories[0]?.score).toBeCloseTo(0.3333, 3);
  });
});
