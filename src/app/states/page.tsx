import type { Metadata } from 'next';
import Link from 'next/link';
import { HovShell } from '@/components/HovShell';
import { STATE_LIST } from '@/lib/legislation/states';
import { listJurisdictions } from '@/lib/legislation/service';

export const metadata: Metadata = {
  title: 'What’s happening in your state?',
  description: 'Pick your state to see its bills, civic news, and transparency red flags in one place.',
};
export const dynamic = 'force-dynamic';

export default async function StatesPage() {
  let counts: Record<string, number> = {};
  try {
    const js = await listJurisdictions();
    counts = Object.fromEntries(js.map((j) => [j.jurisdiction, j.count]));
  } catch { counts = {}; }

  return (
    <HovShell active="states">
      <div className="hov-page">
        <div className="hov-wrap">
          <div className="st-hero">
            <p className="pg-eyebrow" style={{ color: '#7fb0e8' }}>YOUR STATE</p>
            <h1>What’s happening in your state?</h1>
            <p>Pick your state to see its bills, civic news, and transparency red flags together in one place.</p>
          </div>
          <div className="st-grid">
            {STATE_LIST.map((s) => (
              <Link key={s.slug} href={`/states/${s.slug}`} className="st-card">
                <b>{s.name}</b>
                {counts[s.name] ? <span>{counts[s.name]} bills</span> : <span className="muted">—</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </HovShell>
  );
}
