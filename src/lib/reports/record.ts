// Contributor track record. Instead of grading an unresolved claim (which may
// take months of records requests to verify), we grade the CONTRIBUTOR over time
// from claims that have actually resolved, plus their honesty and transparency.
// This is what qualifies someone as an Independent Civic Journalist.
import { prisma } from '@/lib/db/client';
import { RESOLVED_STATUSES } from './labels';

export interface ContributorRecord {
  totalPosts: number;
  resolvedClaims: number;
  verified: number;       // past claims verified
  disproven: number;      // past claims disproven
  corrections: number;    // voluntary corrections made
  evidenceQuality: number;    // 0–100: share of posts with a source/record
  sourceTransparency: number; // 0–100: named/linked sources
  factOpinionSeparation: number; // 0–100: labeled opinion vs claim clearly
  eligibleForJournalist: boolean;
  reasons: string[]; // why (not) eligible
}

export async function contributorRecord(userId: string): Promise<ContributorRecord> {
  const [posts, corrections] = await Promise.all([
    prisma.communityReport.findMany({
      where: { authorUserId: userId, status: 'PUBLISHED' },
      select: { claimStatus: true, sourceUrl: true, label: true, lane: true },
    }),
    prisma.communityReportCorrection.count({
      where: { voluntary: true, report: { authorUserId: userId } },
    }),
  ]);

  const total = posts.length;
  const resolved = posts.filter((p) => RESOLVED_STATUSES.has(p.claimStatus as never));
  const verified = posts.filter((p) => p.claimStatus === 'VERIFIED').length;
  const disproven = posts.filter((p) => p.claimStatus === 'DISPROVEN').length;
  const withSource = posts.filter((p) => !!p.sourceUrl).length;
  // "Separates facts from opinions": opinions labeled OPINION, or claims that carry
  // a non-opinion label — i.e. they didn't dump everything as bare assertion.
  const labeledClearly = posts.filter((p) => p.label !== 'UNVERIFIED_TIP' || p.lane === 'JOURNALIST').length;

  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));
  const evidenceQuality = pct(withSource);
  const sourceTransparency = pct(withSource);
  const factOpinionSeparation = pct(labeledClearly);

  // Eligibility: a real track record, honest corrections, and few unresolved
  // disprovals. Deliberately conservative — journalists are a higher-trust lane.
  const reasons: string[] = [];
  if (total < 5) reasons.push('Post at least 5 community reports.');
  if (verified < 2) reasons.push('Have at least 2 claims verified by records.');
  if (disproven > verified) reasons.push('Too many disproven claims relative to verified ones.');
  if (evidenceQuality < 50) reasons.push('Attach sources to at least half of your posts.');
  const eligible = reasons.length === 0;
  if (eligible) reasons.push('Meets the bar for the Independent Civic Journalist lane.');

  return {
    totalPosts: total,
    resolvedClaims: resolved.length,
    verified, disproven, corrections,
    evidenceQuality, sourceTransparency, factOpinionSeparation,
    eligibleForJournalist: eligible,
    reasons,
  };
}
