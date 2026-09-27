import type { Metadata } from 'next';
import Link from 'next/link';
import '../dashboard.css';
import '../marketing.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

// Public methodology page (spec §4.7 explainability, §10.6 public methodology,
// §34 recommended labels). Static, no DB. Versioned so historical scores stay
// tied to the method used at the time (§10.6).

export const metadata: Metadata = {
  title: 'How trust works — HearOURVOICES',
  description:
    'How HearOURVOICES labels claims, scores government performance, and keeps an audit trail.',
};

const CLAIM_LABELS: [string, string][] = [
  ['Verified', 'Confirmed by primary official records or multiple reliable sources.'],
  ['Strongly / Partially Supported', 'Backed by evidence, in whole or in part.'],
  ['Under review / Unclear', 'Submitted with sources; not yet fully checked.'],
  ['Disputed', 'Credible evidence points in more than one direction.'],
  ['Unsupported / Misleading / False', 'Applied only after review — never because an official simply denies it.'],
  ['Outdated / Cannot be verified', 'Once true but changed, or not checkable with available records.'],
];

const OUTCOME_LABELS = [
  'Allegation', 'Complaint Filed', 'Under Review', 'No Finding', 'Finding Issued',
  'Dismissed', 'Settled Without Admission', 'Convicted', 'Reversed', 'Expunged',
  'Disputed', 'Insufficient Evidence',
];

export default function MethodologyPage() {
  return (
    <>
    <SiteHeader />
    <main style={{ marginLeft: 0, maxWidth: 820, padding: '44px 24px 60px' }}>
      <p className="kicker">METHODOLOGY · VERSION 1.0</p>
      <h1 style={{ font: "800 30px 'Libre Franklin'", color: 'var(--navy)', margin: '4px 0 8px' }}>
        How trust works
      </h1>
      <p style={{ color: '#5e6d73', lineHeight: 1.6 }}>
        HearOURVOICES is built on evidence, not rumor. Every claim shows its status,
        its sources, any official response, and its change history. This page explains
        how those labels and scores are decided. It is public and versioned — when the
        method changes, past scores stay connected to the method used at the time.
      </p>

      <h2 style={{ font: "700 20px 'Libre Franklin'", color: 'var(--navy)', marginTop: 32 }}>
        Claim status labels
      </h2>
      <ul style={{ lineHeight: 1.6, color: '#3e4c52' }}>
        {CLAIM_LABELS.map(([label, desc]) => (
          <li key={label} style={{ marginBottom: 8 }}>
            <b>{label}.</b> {desc}
          </li>
        ))}
      </ul>

      <h2 style={{ font: "700 20px 'Libre Franklin'", color: 'var(--navy)', marginTop: 28 }}>
        Scorecards
      </h2>
      <p style={{ color: '#5e6d73', lineHeight: 1.6 }}>
        Scores describe documented performance, not popularity. Each category shows its
        weight, the metrics behind it, the data period, source quality, a confidence
        level, and the calculation version. <b>Missing data is never counted as zero.</b>{' '}
        When there is too little evidence, we show <b>Insufficient Data</b> instead of a
        number, and every score can be appealed by the affected official or agency.
      </p>

      <h2 style={{ font: "700 20px 'Libre Franklin'", color: 'var(--navy)', marginTop: 28 }}>
        Outcome labels we use
      </h2>
      <p style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {OUTCOME_LABELS.map((l) => (
          <span key={l} className="badge">{l}</span>
        ))}
      </p>

      <h2 style={{ font: "700 20px 'Libre Franklin'", color: 'var(--navy)', marginTop: 28 }}>
        Review, response, and correction
      </h2>
      <p style={{ color: '#5e6d73', lineHeight: 1.6 }}>
        Serious allegations are never published automatically — they are routed to human
        review first. Officials and affected parties can respond, dispute, request
        corrections, and appeal. Corrections stay visible and timestamped. Privileged
        actions are written to an append-only audit log.
      </p>

      <p style={{ marginTop: 36 }}>
        <Link href="/community" style={{ color: 'var(--teal)', fontWeight: 700 }}>
          ← Back to your community brief
        </Link>
      </p>
    </main>
    <SiteFooter />
    </>
  );
}
