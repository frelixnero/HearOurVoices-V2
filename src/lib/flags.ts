// Feature flags. Keep risky/experimental features off by default so they can be
// enabled per-environment without code changes.
//
// Rumors (accuracy-graded rumor board) is OFF by default: a public board of
// rumors about people carries defamation/harassment risk and needs a moderation
// queue + legal review before going live. Set RUMORS_ENABLED=true to turn it on.
export const rumorsEnabled = (): boolean => process.env.RUMORS_ENABLED === 'true';
