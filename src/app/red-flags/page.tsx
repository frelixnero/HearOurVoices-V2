import type { Metadata } from 'next';
import Link from 'next/link';
import { HovShell } from '@/components/HovShell';
import { RED_FLAG_PATTERNS } from '@/lib/civic/labels';

export const metadata: Metadata = {
  title: 'Red Flags — Patterns to Watch',
  description: 'The procedural tactics that reduce transparency — what they are, why they matter, and how hearOURvoices flags them from the public record.',
};

export default function RedFlagsPage() {
  return (
    <HovShell active="redflags">
      <div className="hov-page">
        <div className="hov-wrap">
          <div className="rf-hero">
            <p className="pg-eyebrow" style={{ color: '#f3a29c' }}>RED FLAGS</p>
            <h1>Patterns to watch — so nothing slips through in the dark.</h1>
            <p>
              These are well-known procedural tactics that can reduce transparency. They are <b>patterns, not accusations</b>.
              When a documented Civic News item shows one of these in its record, hearOURvoices raises a 🚩 automatically —
              tied to a sourced fact, never to a rumor. The point isn’t to accuse anyone; it’s to make the process visible.
            </p>
          </div>

          <div className="rf-grid">
            {RED_FLAG_PATTERNS.map((f) => (
              <div key={f.key} className="rf-card">
                <b>{f.icon} {f.title}</b>
                <span>{f.why}</span>
              </div>
            ))}
          </div>

          <div className="rf-note">
            <p style={{ margin: '0 0 10px' }}><b>How flags are raised.</b> Six of these — recorded vote, public notice, posted amendments,
              meeting recording, public comment, and following required procedure — are captured on every Civic News item as a factual
              yes / no / unknown. A red flag appears only on an explicit <b>“no” in the record</b>, so every flag maps to something documented.
              See them in action on <Link href="/news" style={{ color: '#ff9c94' }}>Civic News</Link>.</p>
            <p style={{ margin: 0 }}><b>Have a concern of your own?</b> You can raise a concern about a <b>pattern or a public action</b> — kept about
              what was done, not personal attacks — through <Link href="/reports" style={{ color: '#ff9c94' }}>Community Reports</Link>, where
              submissions are labeled by claim status and reviewed. Please keep it to public actions and verifiable specifics.</p>
          </div>
        </div>
      </div>
    </HovShell>
  );
}
