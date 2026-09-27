import type { Metadata } from 'next';
import Link from 'next/link';
import { HovShell } from '@/components/HovShell';
import { listOfficials } from '@/lib/legislation/service';

export const metadata: Metadata = {
  title: 'Officials — Legislative Records',
  description: 'Every official’s documented legislative record: the bills they sponsored, from verified public data. Facts, not rumors.',
};
export const dynamic = 'force-dynamic';

export default async function OfficialsPage() {
  let officials: Awaited<ReturnType<typeof listOfficials>> = [];
  try { officials = await listOfficials(); } catch { officials = []; }

  return (
    <HovShell active="officials">
      <div className="hov-page">
        <div className="hov-wrap">
          <div className="bl-hero">
            <p className="pg-eyebrow" style={{ color: '#7fb0e8' }}>THE RECORD</p>
            <h1>Officials — by their record, not rumors.</h1>
            <p>
              Each profile is built only from the <b>documented legislative record</b> — the bills an official sponsored,
              pulled from verified public data. Names are tied to facts and votes, never to unverified claims.
            </p>
          </div>

          {officials.length === 0 ? (
            <div className="sh-card" style={{ textAlign: 'center', color: '#9aa6bd' }}>
              No officials yet. They appear automatically once bills are synced (with sponsors) from the <Link href="/bills" style={{ color: '#7fb0e8' }}>Bills</Link> panel.
            </div>
          ) : (
            <div className="off-grid">
              {officials.map((o) => (
                <Link key={o.nameKey} href={`/officials/${o.nameKey}`} className="off-card">
                  <b>{o.name}</b>
                  <span>{o.bills} bill{o.bills === 1 ? '' : 's'}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </HovShell>
  );
}
