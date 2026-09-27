// Display metadata for the Community Reports labels + claim statuses. Colors and
// human text live here so the UI and any exports stay consistent.

export const POST_LABELS = [
  'OPINION', 'UNVERIFIED_TIP', 'FIRSTHAND_ACCOUNT', 'EVIDENCE_SUBMITTED',
  'CORRECTION_ISSUED', 'VERIFIED_BY_RECORDS', 'DISPROVEN',
] as const;
export type PostLabel = (typeof POST_LABELS)[number];

export const LABEL_META: Record<PostLabel, { text: string; color: string }> = {
  OPINION: { text: 'Opinion', color: '#7f6bd6' },
  UNVERIFIED_TIP: { text: 'Unverified tip', color: '#d9a334' },
  FIRSTHAND_ACCOUNT: { text: 'Firsthand account', color: '#3a8fd6' },
  EVIDENCE_SUBMITTED: { text: 'Evidence submitted', color: '#0d9488' },
  CORRECTION_ISSUED: { text: 'Correction issued', color: '#8b96ab' },
  VERIFIED_BY_RECORDS: { text: 'Verified by records', color: '#1c9d5b' },
  DISPROVEN: { text: 'Disproven', color: '#e63329' },
};

export const CLAIM_STATUSES = [
  'UNREVIEWED', 'UNVERIFIED', 'EVIDENCE_DEVELOPING', 'PARTIALLY_SUPPORTED',
  'VERIFIED', 'DISPUTED', 'DISPROVEN', 'RETRACTED',
] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const STATUS_META: Record<ClaimStatus, { text: string; color: string; note: string }> = {
  UNREVIEWED: { text: 'Unreviewed', color: '#8b96ab', note: 'No one has checked this yet.' },
  UNVERIFIED: { text: 'Unverified', color: '#a0a9bd', note: 'Not yet supported by evidence.' },
  EVIDENCE_DEVELOPING: { text: 'Evidence developing', color: '#d9a334', note: 'Evidence is being gathered.' },
  PARTIALLY_SUPPORTED: { text: 'Partially supported', color: '#c9a227', note: 'Some parts are supported by evidence.' },
  VERIFIED: { text: 'Verified', color: '#1c9d5b', note: 'Confirmed by records or reliable sources.' },
  DISPUTED: { text: 'Disputed', color: '#e0752f', note: 'Credible evidence points in more than one direction.' },
  DISPROVEN: { text: 'Disproven', color: '#e63329', note: 'Evidence shows this is not accurate.' },
  RETRACTED: { text: 'Retracted', color: '#6b7688', note: 'Withdrawn by the author.' },
};

// Claim statuses that count as "resolved" — only then does a contributor's record
// reflect it (so no one is punished while records take months to arrive).
export const RESOLVED_STATUSES: ReadonlySet<ClaimStatus> = new Set([
  'VERIFIED', 'DISPROVEN', 'RETRACTED', 'DISPUTED',
]);
