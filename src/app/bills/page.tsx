import type { Metadata } from 'next';
import Link from 'next/link';
import { HovShell } from '@/components/HovShell';
import { listBills, listJurisdictions } from '@/lib/legislation/service';
import { openStatesEnabled } from '@/lib/legislation/openstates';

export const metadata: Metadata = {
  title: 'Bills — Verified Legislative Records',
  description: 'Real bills, sponsors, and votes pulled from public legislative records (OpenStates) for states and Congress.',
};
export const dynamic = 'force-dynamic';

export default async function BillsPage({ searchParams }: { searchParams: { jurisdiction?: string } }) {
  const jurisdiction = searchParams.jurisdiction;
  let bills: Awaited<ReturnType<typeof listBills>> = [];
  let jurisdictions: Awaited<ReturnType<typeof listJurisdictions>> = [];
  try { [bills, jurisdictions] = await Promise.all([listBills({ jurisdiction, take: 60 }), listJurisdictions()]); }
  catch { bills = []; jurisdictions = []; }

  return (
    <HovShell active="bills">
      <div className="hov-page">
        <div className="hov-wrap">
          <div className="bl-hero">
            <p className="pg-eyebrow" style={{ color: '#7fb0e8' }}>VERIFIED PUBLIC RECORDS</p>
            <h1>Bills — real records, not rumors.</h1>
            <p>
              Legislation pulled directly from public sources (OpenStates) — sponsors, actions, and roll-call votes,
              exactly as recorded. When the record shows a voice vote with no tally, a 🚩 red flag is raised automatically.
            </p>
          </div>

          {jurisdictions.length > 0 && (
            <div className="bl-filter">
              <Link href="/bills" className={!jurisdiction ? 'on' : ''}>All</Link>
              {jurisdictions.map((j) => (
                <Link key={j.jurisdiction} href={`/bills?jurisdiction=${encodeURIComponent(j.jurisdiction)}`} className={jurisdiction === j.jurisdiction ? 'on' : ''}>
                  {j.jurisdiction} <span>{j.count}</span>
                </Link>
              ))}
            </div>
          )}

          {bills.length === 0 ? (
            <div className="sh-card" style={{ textAlign: 'center', color: '#9aa6bd' }}>
              {openStatesEnabled()
                ? 'No bills loaded yet. An admin can sync a jurisdiction from the admin panel.'
                : 'Legislative data isn’t connected yet. Add an OpenStates API key (OPENSTATES_API_KEY) and sync a state from the admin panel to populate this page with real bills.'}
            </div>
          ) : (
            bills.map((b) => (
              <Link key={b.id} href={`/bills/${b.id}`} className="bl-card">
                <div className="bl-meta">{b.jurisdiction} · {b.session}{b.classification[0] ? ` · ${b.classification[0]}` : ''}</div>
                <h2><span className="bl-id">{b.identifier}</span> {b.title}</h2>
                {b.latestActionDescription && <p className="bl-action">Latest: {b.latestActionDescription}{b.latestActionDate ? ` (${b.latestActionDate})` : ''}</p>}
                {b.redFlags.length > 0 && <div className="bl-flags">{b.redFlags.map((f) => <span key={f}>🚩 {f}</span>)}</div>}
              </Link>
            ))
          )}
          <p className="rf-note" style={{ marginTop: 18 }}>
            Data source: <b>OpenStates</b> public API. Figures are cached from the official record; always confirm on the
            linked source before relying on them.
          </p>
        </div>
      </div>
    </HovShell>
  );
}
