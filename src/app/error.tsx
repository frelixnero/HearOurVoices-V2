'use client';

import { useEffect } from 'react';
import './dashboard.css';
import './marketing.css';

// App-level error boundary (spec §45 rule 16 — error states). Client component.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // In production this would report to an error monitor (§32).
    console.error(error);
  }, [error]);

  return (
    <main className="simple" style={{ textAlign: 'center', paddingTop: 80 }}>
      <p className="section-eyebrow">SOMETHING WENT WRONG</p>
      <h1 className="big-title">We hit a snag</h1>
      <p className="explain" style={{ maxWidth: 540, margin: '0 auto 24px' }}>
        This one’s on us, not you. Please try again — and if it keeps happening, let us know.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-lg" onClick={() => reset()}>Try again</button>
        <a className="btn btn-outline btn-lg" href="/">Go home</a>
      </div>
    </main>
  );
}
