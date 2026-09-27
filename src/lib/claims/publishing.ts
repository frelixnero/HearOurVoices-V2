// Claim intake & publication rules (spec §13.5, §25.2, §45 rules 5 & 6).
// Central, unit-testable policy so the "serious allegations never auto-publish"
// rule can be proven by tests rather than trusting scattered route code.
import type { ClaimType } from '@prisma/client';

// Claim types that assert wrongdoing and therefore can never skip human review.
const SERIOUS_TYPES: ReadonlySet<ClaimType> = new Set<ClaimType>([
  'ALLEGATION',
  'LEGAL_CLAIM',
  'CONCLUSION',
]);

// Keyword heuristic is a *floor*, not a truth judgement — it only routes to
// review, it never publishes or labels anything (§25.4).
const SERIOUS_KEYWORDS = [
  'fraud', 'corrupt', 'bribe', 'steal', 'stole', 'theft', 'criminal', 'crime',
  'assault', 'abuse', 'illegal', 'launder', 'embezzle', 'coverup', 'cover-up',
];

export function isSeriousAllegation(input: {
  claimType: ClaimType;
  text: string;
}): boolean {
  if (SERIOUS_TYPES.has(input.claimType)) return true;
  const lower = input.text.toLowerCase();
  return SERIOUS_KEYWORDS.some((k) => lower.includes(k));
}

export type IntakeDecision =
  | { status: 'IN_RESEARCH_REVIEW'; autoPublish: false; reason: string }
  | { status: 'NEEDS_EVIDENCE'; autoPublish: false; reason: string }
  | { status: 'SUBMITTED'; autoPublish: false; reason: string };

/**
 * Decide the initial post-submission status of a claim. NOTHING here ever returns
 * a PUBLISHED status — publication is always a separate, permissioned, human step
 * (requires `claim.publish`). This function only decides where the claim queues.
 */
export function decideIntake(input: {
  claimType: ClaimType;
  text: string;
  hasEvidence: boolean;
}): IntakeDecision {
  if (isSeriousAllegation(input)) {
    return {
      status: 'IN_RESEARCH_REVIEW',
      autoPublish: false,
      reason: 'Serious allegation — routed to human review before any publication (§25.2).',
    };
  }
  if (!input.hasEvidence) {
    return {
      status: 'NEEDS_EVIDENCE',
      autoPublish: false,
      reason: 'Claim has no linked evidence — evidence required before review (§4.1).',
    };
  }
  return {
    status: 'SUBMITTED',
    autoPublish: false,
    reason: 'Queued for standard review.',
  };
}
