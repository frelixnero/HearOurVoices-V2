// Neutrality lint for journalist reports. Reporters must be neutral, so this
// flags loaded/editorializing language for transparency. It does NOT block a
// report — the flags are shown so readers (and the reporter) can judge tone.
// Opinion-type reports are exempt from being penalized, but still linted.

// Emotionally loaded adjectives, absolutes, and editorializing verbs.
const LOADED = [
  'disgraceful', 'shameful', 'outrageous', 'appalling', 'disgusting', 'evil',
  'corrupt', 'crooked', 'hero', 'heroic', 'villain', 'obviously', 'clearly lying',
  'everyone knows', 'undeniable', 'sham', 'witch hunt', 'radical', 'extremist',
  'devastating', 'catastrophic', 'stunning', 'shocking', 'slammed', 'blasted',
  'destroyed', 'demolished', 'epic', 'perfect', 'worst', 'best ever', 'always',
  'never', 'clearly', 'undoubtedly', 'traitor', 'liar', 'lie', 'lies',
];

export interface NeutralityResult {
  flags: string[]; // distinct loaded terms found
  neutralityScore: number; // 0–100 (100 = no loaded language found)
  note: string;
}

export function checkNeutrality(text: string): NeutralityResult {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const term of LOADED) {
    // word-ish boundary match
    const re = new RegExp(`(^|[^a-z])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i');
    if (re.test(lower)) found.add(term);
  }
  const flags = [...found];
  const words = Math.max(1, lower.split(/\s+/).length);
  // Penalize by density of loaded terms.
  const score = Math.max(0, Math.round(100 - (flags.length / words) * 100 * 8));
  const note =
    flags.length === 0
      ? 'No loaded language detected.'
      : `Possible loaded language: ${flags.join(', ')}. Consider neutral wording.`;
  return { flags, neutralityScore: score, note };
}
