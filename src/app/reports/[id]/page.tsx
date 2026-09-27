import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { HovShell } from '@/components/HovShell';
import { LabelBadge, StatusBadge } from '@/components/ReportBadge';
import { getReport } from '@/lib/reports/service';
import { STATUS_META, type ClaimStatus } from '@/lib/reports/labels';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try { const r = await getReport(params.id); if (r) return { title: r.title, description: (r.whyImportant ?? r.body).slice(0, 150) }; }
  catch { /* ignore */ }
  return { title: 'Community Report' };
}

function timeAgo(d: Date) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  if (!children) return null;
  return <div className="rp-section"><h3>{title}</h3><p>{children}</p></div>;
}

export default async function ReportPage({ params }: { params: { id: string } }) {
  let r;
  try { r = await getReport(params.id); } catch { r = null; }
  if (!r) notFound();
  const statusMeta = STATUS_META[r.claimStatus as ClaimStatus] ?? STATUS_META.UNREVIEWED;
  const isJ = r.lane === 'JOURNALIST';

  return (
    <HovShell active="reports">
      <div className="hov-page">
        <div className="hov-wrap" style={{ maxWidth: 740 }}>
          <Link href={`/reports?lane=${r.lane.toLowerCase()}`} style={{ color: '#8b96ab', fontWeight: 600 }}>← All reports</Link>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '16px 0 8px' }}>
            <LabelBadge label={r.label} />
            <StatusBadge status={r.claimStatus} />
          </div>
          <h1 style={{ font: "900 30px/1.18 'Inter'", color: '#fff', margin: '4px 0 8px' }}>{r.title}</h1>
          <div className="rp-byline">By <b style={{ color: '#cfd6e4' }}>{r.displayName}</b> · {timeAgo(r.createdAt)} · {isJ ? 'Civic journalist' : 'Citizen report'}</div>

          <div className="rp-note"><b>Claim status — {statusMeta.text}.</b> {statusMeta.note} Unresolved claims are not graded true or false.</div>

          {isJ ? (
            <>
              <Section title="The exact claim being examined">{r.exactClaim}</Section>
              <Section title="What the source directly shows">{r.videoShows}</Section>
              <Section title="What it does NOT prove">{r.videoDoesntProve}</Section>
              <Section title="Confirmed / unconfirmed parts">{r.confirmedParts}</Section>
              <Section title="Where the information originated">{r.origin}</Section>
              <Section title="Why this matters">{r.whyImportant}</Section>
              <Section title="Response from the affected party">{r.affectedParty ? `${r.affectedParty}: ${r.affectedResponse}` : r.affectedResponse}</Section>
              <Section title="Disclosed conflicts of interest">{r.conflicts}</Section>
            </>
          ) : (
            <div className="rp-section"><h3>Report</h3><p>{r.body}</p></div>
          )}

          {r.sourceUrl && (
            <a className="rp-source" href={r.sourceUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={16} /> View the source
            </a>
          )}

          {r.neutralityFlags.length > 0 && (
            <div className="rp-neut" style={{ marginTop: 16 }}>⚖️ Neutrality check flagged possibly loaded wording: <b>{r.neutralityFlags.join(', ')}</b>.</div>
          )}

          {r.corrections.length > 0 && (
            <>
              <h2 style={{ color: '#fff', fontSize: 18, margin: '24px 0 10px' }}>Corrections</h2>
              {r.corrections.map((c) => (
                <div key={c.id} className="rp-note" style={{ borderLeftColor: '#d9a334' }}>
                  {c.voluntary ? 'Voluntary correction' : 'Correction'} · {timeAgo(c.createdAt)}: {c.note}
                </div>
              ))}
            </>
          )}

          {r.statusEvents.length > 0 && (
            <>
              <h2 style={{ color: '#fff', fontSize: 18, margin: '24px 0 10px' }}>Status history</h2>
              {r.statusEvents.map((e) => (
                <div key={e.id} className="rp-ev">
                  <span className="st sup">{STATUS_META[e.fromStatus as ClaimStatus]?.text} → {STATUS_META[e.toStatus as ClaimStatus]?.text}</span>
                  <p>{e.rationale} · {timeAgo(e.createdAt)}</p>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </HovShell>
  );
}
