import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HovShell } from '@/components/HovShell';
import { stateFromSlug } from '@/lib/legislation/states';
import { listBills } from '@/lib/legislation/service';
import { newsForState } from '@/lib/civic/service';
import { SCOPE_META, detectRedFlags, type CivicScope } from '@/lib/civic/labels';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { state: string } }): Promise<Metadata> {
  const name = stateFromSlug(params.state);
  return name ? { title: `What’s happening in ${name}?`, description: `Bills, civic news, and red flags for ${name}.` } : { title: 'State' };
}

export default async function StatePage({ params }: { params: { state: string } }) {
  const name = stateFromSlug(params.state);
  if (!name) notFound();

  let bills: Awaited<ReturnType<typeof listBills>> = [];
  let news: Awaited<ReturnType<typeof newsForState>> = [];
  try { [bills, news] = await Promise.all([listBills({ jurisdiction: name, take: 12 }), newsForState(name)]); }
  catch { bills = []; news = []; }

  // Aggregate red flags from the documented record (bills + civic-news process checks).
  const billFlags = bills.filter((b) => b.redFlags.length > 0);
  const newsFlags = news.map((n) => ({ n, flags: detectRedFlags(n as unknown as Record<string, boolean | null>) })).filter((x) => x.flags.length > 0);
  const flagTotal = billFlags.reduce((a, b) => a + b.redFlags.length, 0) + newsFlags.reduce((a, x) => a + x.flags.length, 0);

  return (
    <HovShell active="states">
      <div className="hov-page">
        <div className="hov-wrap">
          <Link href="/states" style={{ color: '#8b96ab', fontWeight: 600 }}>← All states</Link>
          <div className="st-hero" style={{ marginTop: 12 }}>
            <p className="pg-eyebrow" style={{ color: '#7fb0e8' }}>YOUR STATE</p>
            <h1>What’s happening in {name}?</h1>
            <p>Bills, civic news, and transparency red flags for {name} — from the public record.</p>
          </div>

          {flagTotal > 0 && (
            <div className="nw-redflags">
              <h3>🚩 {flagTotal} red flag{flagTotal === 1 ? '' : 's'} in the record</h3>
              <p className="rf-sub">Each maps to a documented “no” or an unrecorded vote — not opinion. <Link href="/red-flags">What do these mean?</Link></p>
              {billFlags.map((b) => (
                <div key={b.id} className="rf-item"><b>🚩 {b.identifier} — {b.redFlags.join(', ')}</b><span><Link href={`/bills/${b.id}`} style={{ color: '#ffb3ab' }}>{b.title.slice(0, 90)}</Link></span></div>
              ))}
              {newsFlags.map(({ n, flags }) => (
                <div key={n.id} className="rf-item"><b>🚩 {flags.map((f) => f.title).join(', ')}</b><span><Link href={`/news/${n.id}`} style={{ color: '#ffb3ab' }}>{n.title.slice(0, 90)}</Link></span></div>
              ))}
            </div>
          )}

          <div className="st-sec">
            <div className="st-sec-head">
              <h2>Bills</h2>
              {bills.length > 0 && <Link href={`/bills?jurisdiction=${encodeURIComponent(name)}`}>See all {name} bills →</Link>}
            </div>
            {bills.length === 0 ? (
              <div className="sh-card" style={{ color: '#9aa6bd' }}>No bills loaded for {name} yet. An admin can sync it from the <Link href="/bills" style={{ color: '#7fb0e8' }}>Bills</Link> panel.</div>
            ) : (
              bills.map((b) => (
                <Link key={b.id} href={`/bills/${b.id}`} className="bl-card">
                  <div className="bl-meta">{b.session}{b.classification[0] ? ` · ${b.classification[0]}` : ''}</div>
                  <h3 style={{ font: "800 16px/1.35 'Inter'", color: '#fff', margin: '2px 0 0' }}><span className="bl-id">{b.identifier}</span> {b.title}</h3>
                  {b.latestActionDescription && <p className="bl-action">Latest: {b.latestActionDescription}</p>}
                  {b.redFlags.length > 0 && <div className="bl-flags">{b.redFlags.map((f) => <span key={f}>🚩 {f}</span>)}</div>}
                </Link>
              ))
            )}
          </div>

          <div className="st-sec">
            <div className="st-sec-head">
              <h2>Civic news</h2>
              <Link href="/news">All civic news →</Link>
            </div>
            {news.length === 0 ? (
              <div className="sh-card" style={{ color: '#9aa6bd' }}>No civic news tagged to {name} yet.</div>
            ) : (
              news.map((n) => (
                <Link key={n.id} href={`/news/${n.id}`} className="bl-card">
                  <div className="bl-meta"><span style={{ color: SCOPE_META[n.scope as CivicScope].color }}>{SCOPE_META[n.scope as CivicScope].text}</span> · {n.actorType}{n.jurisdiction ? ` · ${n.jurisdiction}` : ''}</div>
                  <h3 style={{ font: "800 16px/1.35 'Inter'", color: '#fff', margin: '2px 0 6px' }}>{n.title}</h3>
                  <p className="bl-action" style={{ margin: 0 }}>{n.judgment.total > 0 ? `${n.judgment.badPct}% Bad · ${n.judgment.goodPct}% Good · ${n.judgment.total} votes` : 'No votes yet'}</p>
                </Link>
              ))
            )}
          </div>

          <p className="rf-note">Data from public sources (OpenStates, LegiScan) and community civic-news posts. Always confirm on the linked source.</p>
        </div>
      </div>
    </HovShell>
  );
}
