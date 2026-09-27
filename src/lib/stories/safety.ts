// Story safety screen — the "Safe & Moderated" gate. Pure + unit-testable.
// It does two independent things:
//  1) routes clearly prohibited content (threats, doxxing) to human review
//     instead of publishing it,
//  2) flags posts that suggest the author may be in crisis so the UI can gently
//     surface support resources (this NEVER blocks the post).
// This is a floor, not a judgement — real deployments add a human queue + a
// professional trust-and-safety review.
export interface StoryScreen {
  decision: 'publish' | 'review';
  crisis: boolean;
  reason?: string;
}

// Directed threats / harassment / doxxing → hold for review.
const THREAT = [
  /\bi('?ll| will| am going to)\s+(kill|hurt|find|hunt|beat)\s+you\b/i,
  /\bkill yourself\b/i,
  /\bi('?ll| will)\s+(kill|hurt)\s+(him|her|them|you)\b/i,
];
const DOXX = [
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN-like
  /\blives?\s+at\s+\d{1,5}\s+\w+/i, // "lives at 123 Main"
];

// Author-in-crisis signals → publish, but attach support (never block).
const CRISIS = [
  /\b(kill myself|end my life|suicid|want to die|hurt myself|self[-\s]?harm|no reason to live)\b/i,
];

export function screenStory(body: string): StoryScreen {
  const crisis = CRISIS.some((r) => r.test(body));

  for (const r of THREAT) {
    if (r.test(body)) return { decision: 'review', crisis, reason: 'Possible threat — held for review.' };
  }
  for (const r of DOXX) {
    if (r.test(body)) return { decision: 'review', crisis, reason: 'Possible private/personal information — held for review.' };
  }
  return { decision: 'publish', crisis };
}
