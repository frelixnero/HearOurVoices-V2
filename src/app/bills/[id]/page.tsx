import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { HovShell } from '@/components/HovShell';
import { getBill } from '@/lib/legislation/service';

export const dynamic = 'force-dynamic';

interface Sponsor { name: string; classification?: string | null; primary?: boolean }
interface Action { date?: string | null; description: string; classification?: string[] }
interface Vote { date?: string; motion?: string; result?: string; yes: number; no: number; other: number }
interface Source { url: string; note?: string | null }

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try { const b = await getBill(params.id); if (b) return { title: `${b.identifier} — ${b.jurisdiction}`, description: b.title.slice(0, 150) }; }
  catch { /* ignore */ }
  return { title: 'Bill' };
}

export default async function BillDetail({ params }: { params: { id: string } }) {
  let b;
  try { b = await getBill(params.id); } catch { b = null; }
  if (!b) notFound();
  const sponsors = (b.sponsors as unknown as Sponsor[]) ?? [];
  const actions = (b.actions as unknown as Action[]) ?? [];
  const votes = (b.votes as unknown as Vote[]) ?? [];
  const sources = (b.sources as unknown as Source[]) ?? [];

  return (
    <HovShell active="bills">
      <div className="hov-page">
        <div className="hov-wrap" style={{ maxWidth: 760 }}>
          <Link href="/bills" style={{ color: '#56636a', fontWeight: 600 }}>← All bills</Link>
          <div className="bl-meta" style={{ marginTop: 14 }}>{b.jurisdiction} · {b.session}{b.classification[0] ? ` · ${b.classification[0]}` : ''}</div>
          <h1 style={{ font: "900 28px/1.2 'Inter'", color: '#172632', margin: '4px 0 6px' }}><span className="bl-id">{b.identifier}</span> {b.title}</h1>
          {b.latestActionDescription && <p className="bl-action">Latest action: {b.latestActionDescription}{b.latestActionDate ? ` (${b.latestActionDate})` : ''}</p>}

          {b.redFlags.length > 0 && (
            <div className="nw-redflags">
              <h3>🚩 Red flags in the record ({b.redFlags.length})</h3>
              <p className="rf-sub">Derived only from the documented vote record. <Link href="/red-flags">What do these mean?</Link></p>
              {b.redFlags.map((f) => <div key={f} className="rf-item"><b>🚩 {f}</b><span>A vote recorded as passing with no yes/no tally leaves no names attached to the outcome.</span></div>)}
            </div>
          )}

          {b.subjects.length > 0 && (
            <div className="nw-sec"><h3>Subjects</h3><div className="jv-words">{b.subjects.map((s) => <span key={s}>{s}</span>)}</div></div>
          )}

          {sponsors.length > 0 && (
            <div className="nw-sec">
              <h3>Sponsors</h3>
              <ul className="nw-toplist">{sponsors.map((s, i) => <li key={i}>{s.name}{s.primary ? ' · primary' : ''}{s.classification ? ` · ${s.classification}` : ''}</li>)}</ul>
            </div>
          )}

          {votes.length > 0 && (
            <div className="nw-sec">
              <h3>Votes</h3>
              {votes.map((v, i) => (
                <div key={i} className="bl-vote">
                  <div className="bl-vote-top"><b>{v.motion ?? 'Vote'}</b><span className={`bl-result ${(v.result ?? '').toLowerCase().includes('pass') ? 'pass' : 'fail'}`}>{v.result ?? '—'}</span></div>
                  <div className="bl-tally">
                    <span className="y">Yes {v.yes}</span><span className="n">No {v.no}</span><span className="o">Other {v.other}</span>
                    {v.yes === 0 && v.no === 0 && <span className="bl-voice">🚩 no recorded tally</span>}
                    {v.date && <span style={{ color: '#56636a' }}>· {v.date}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {actions.length > 0 && (
            <div className="nw-sec">
              <h3>Actions</h3>
              <div className="jv-tl">
                {actions.map((a, i) => (
                  <div key={i} style={{ display: 'contents' }}>
                    <div className="dot" />
                    <div className="ev">{a.date && <time>{a.date}</time>}<p>{a.description}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sources.length > 0 && (
            <div className="nw-sec">
              <h3>Official sources</h3>
              {sources.map((s, i) => (
                <div key={i} className="nw-src">
                  <span className="lb" style={{ background: '#1c9d5b' }}>Official record</span>
                  <b style={{ wordBreak: 'break-all' }}>{s.note || s.url}</b>
                  <a href={s.url} target="_blank" rel="noreferrer" style={{ marginLeft: 'auto' }}><ExternalLink size={14} /> open</a>
                </div>
              ))}
            </div>
          )}

          {b.sourceUrl && (
            <p style={{ marginTop: 14 }}>
              <a href={b.sourceUrl} target="_blank" rel="noreferrer" style={{ color: '#0d6b68', fontWeight: 700 }}>View full record on {b.source === 'legiscan' ? 'LegiScan' : 'OpenStates'} ↗</a>
            </p>
          )}
          <p className="nw-disc">Verified public-record data cached from {b.source === 'legiscan' ? 'LegiScan' : 'OpenStates'}. Always confirm on the official source before relying on it.</p>
        </div>
      </div>
    </HovShell>
  );
}
