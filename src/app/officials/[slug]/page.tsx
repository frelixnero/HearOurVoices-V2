import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { HovShell } from '@/components/HovShell';
import { getOfficial } from '@/lib/legislation/service';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try { const o = await getOfficial(params.slug); if (o) return { title: `${o.name} — Legislative record`, description: `Bills sponsored by ${o.name}, from the public record.` }; }
  catch { /* ignore */ }
  return { title: 'Official' };
}

export default async function OfficialPage({ params }: { params: { slug: string } }) {
  let o;
  try { o = await getOfficial(params.slug); } catch { o = null; }
  if (!o) notFound();

  return (
    <HovShell active="officials">
      <div className="hov-page">
        <div className="hov-wrap" style={{ maxWidth: 800 }}>
          <Link href="/officials" style={{ color: '#56636a', fontWeight: 600 }}>← All officials</Link>
          <div className="bl-hero" style={{ marginTop: 12 }}>
            <p className="pg-eyebrow" style={{ color: '#0d6b68' }}>LEGISLATIVE RECORD</p>
            <h1>{o.name}</h1>
            <p>
              {o.jurisdictions.join(', ')} · {o.bills.length} sponsored bill{o.bills.length === 1 ? '' : 's'}
              {o.flagTotal > 0 && <> · <span style={{ color: '#d64b3c', fontWeight: 700 }}>🚩 {o.flagTotal} red flag{o.flagTotal === 1 ? '' : 's'} in the record</span></>}
            </p>
          </div>

          <div className="st-sec">
            <div className="st-sec-head"><h2>Sponsored bills</h2></div>
            {o.bills.map((b) => (
              <Link key={b.id} href={`/bills/${b.id}`} className="bl-card">
                <div className="bl-meta">{b.jurisdiction} · {b.session}{b.primary ? ' · primary sponsor' : ''}</div>
                <h3 style={{ font: "800 16px/1.35 'Inter'", color: '#172632', margin: '2px 0 0' }}><span className="bl-id">{b.identifier}</span> {b.title}</h3>
                {b.latestActionDescription && <p className="bl-action">Latest: {b.latestActionDescription}</p>}
                {b.redFlags.length > 0 && <div className="bl-flags">{b.redFlags.map((f) => <span key={f}>🚩 {f}</span>)}</div>}
              </Link>
            ))}
          </div>

          <p className="nw-disc">Built only from verified public sponsorship records. This is a factual legislative record — not a judgment of the person. Always confirm on the linked source.</p>
        </div>
      </div>
    </HovShell>
  );
}
