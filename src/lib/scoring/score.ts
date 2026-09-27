// Scorecard calculation (spec §10.5). The critical rule: MISSING DATA IS NEVER
// ZERO (§10.5, §45 rule 10). Metrics/categories without data are EXCLUDED from
// the weighted average, and if too little remains we return insufficientData
// instead of a number (§10.4).
export interface MetricInput {
  name: string;
  normalizedScore: number | null; // 0..1, or null when no data
  weight: number;
  evidenceConfidence: number; // 0..1
}

export interface CategoryInput {
  name: string;
  weight: number;
  metrics: MetricInput[];
}

export interface CategoryResult {
  name: string;
  score: number | null; // null => insufficient data for this category
  weight: number;
  confidence: 'good' | 'mixed' | 'concerning' | 'insufficient_data';
  activeMetricCount: number;
}

export interface ScoreResult {
  overallScore: number | null; // null => insufficient data overall
  insufficientData: boolean;
  categories: CategoryResult[];
}

// Minimum active metrics required before a category is scored at all.
const MIN_METRICS_PER_CATEGORY = 1;
const MIN_ACTIVE_CATEGORY_WEIGHT = 0.5; // fraction of total category weight that must have data

function labelFor(score: number): CategoryResult['confidence'] {
  if (score >= 0.75) return 'good';
  if (score >= 0.5) return 'mixed';
  return 'concerning';
}

export function computeScore(categories: CategoryInput[]): ScoreResult {
  const catResults: CategoryResult[] = categories.map((cat) => {
    const active = cat.metrics.filter((m) => m.normalizedScore !== null);
    if (active.length < MIN_METRICS_PER_CATEGORY) {
      return {
        name: cat.name,
        score: null,
        weight: cat.weight,
        confidence: 'insufficient_data',
        activeMetricCount: 0,
      };
    }
    // metric contribution = score × weight × evidenceConfidence (§10.5)
    const weightedSum = active.reduce(
      (acc, m) => acc + (m.normalizedScore ?? 0) * m.weight * m.evidenceConfidence,
      0,
    );
    const activeWeight = active.reduce((acc, m) => acc + m.weight * m.evidenceConfidence, 0);
    const score = activeWeight > 0 ? weightedSum / activeWeight : null;
    return {
      name: cat.name,
      score,
      weight: cat.weight,
      confidence: score === null ? 'insufficient_data' : labelFor(score),
      activeMetricCount: active.length,
    };
  });

  const scored = catResults.filter((c) => c.score !== null);
  const totalCategoryWeight = categories.reduce((a, c) => a + c.weight, 0);
  const activeCategoryWeight = scored.reduce((a, c) => a + c.weight, 0);

  // Not enough of the model has data → show Insufficient Data, not a number.
  if (
    totalCategoryWeight === 0 ||
    activeCategoryWeight / totalCategoryWeight < MIN_ACTIVE_CATEGORY_WEIGHT
  ) {
    return { overallScore: null, insufficientData: true, categories: catResults };
  }

  const overall =
    scored.reduce((a, c) => a + (c.score ?? 0) * c.weight, 0) / activeCategoryWeight;

  return { overallScore: overall, insufficientData: false, categories: catResults };
}
