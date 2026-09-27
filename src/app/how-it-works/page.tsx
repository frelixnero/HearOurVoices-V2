import type { Metadata } from 'next';
import Link from 'next/link';
import '../dashboard.css';
import '../marketing.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'How it works',
  description: 'How HearOURVOICES turns records and evidence into something anyone can understand and act on.',
};

const STEPS = [
  ['Pick your area', 'Tell us your city or county. We figure out your leaders, agencies, and courts — without ever showing your home address.'],
  ['Read the simple brief', 'A short, plain-language list of what changed: votes, budgets, new rules, and court news near you.'],
  ['Check the proof', 'Every claim shows a status — Verified, Disputed, or Under review — and links to the records behind it.'],
  ['See who’s running', 'Before an election, compare candidates side by side: what they want, what they’re against, pros and cons.'],
  ['Take action', 'Ask for public records with guided templates, sign lawful petitions, and follow whether officials responded.'],
  ['Everything is tracked', 'Corrections stay visible. Important changes are written to a public, append-only history.'],
];

export default function HowItWorksPage() {
  return (
    <>
      <SiteHeader />
      <main className="simple">
        <p className="section-eyebrow">HOW IT WORKS</p>
        <h1 className="big-title">Simple enough for everyone</h1>
        <p className="explain">
          You should not need a law degree to understand your own government. Here is the whole thing,
          step by step.
        </p>
        <div style={{ display: 'grid', gap: 14, marginTop: 24 }}>
          {STEPS.map(([t, d], i) => (
            <div key={t} className="cand" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 16, alignItems: 'start' }}>
              <div className="step-num" style={{ margin: 0 }}>{i + 1}</div>
              <div>
                <h3 style={{ font: "700 19px 'Libre Franklin'", color: 'var(--navy)', margin: '2px 0 6px' }}>{t}</h3>
                <p style={{ fontSize: 16, lineHeight: 1.55, color: '#54636a', margin: 0 }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 30 }}>
          <Link href="/community" className="btn btn-primary btn-lg">Open the app →</Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
