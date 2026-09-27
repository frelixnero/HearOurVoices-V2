import type { Metadata } from 'next';
import Link from 'next/link';
import { HovShell } from '@/components/HovShell';
import { LabelBadge, StatusBadge } from '@/components/ReportBadge';
import { CitizenSubmit, JournalistSubmit } from '@/components/ReportSubmit';
import { JournalistApply } from '@/components/JournalistApply';
import { listReports } from '@/lib/reports/service';
import { getCurrentUser } from '@/lib/auth/session';
import { isJournalist } from '@/lib/reports/journalist';

export const metadata: Metadata = {
  title: 'Community Reports',
  description: 'Citizen tips & opinions and independent civic journalism — clearly labeled, with claim status and evidence.',
};
export const dynamic = 'force-dynamic';

function timeAgo(d: Date) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default async function ReportsPage({ searchParams }: { searchParams: { lane?: string } }) {
  const lane = searchParams.lane === 'journalist' ? 'JOURNALIST' : 'CITIZEN';
  const user = await getCurrentUser().catch(() => null);
  const canJournalist = user ? await isJournalist(user.id).catch(() => false) : false;

  let items: Awaited<ReturnType<typeof listReports>>['items'] = [];
  try { ({ items } = await listReports({ lane })); } catch { items = []; }

  return (
    <HovShell active="reports">
      <div className="hov-page">
        <div className="hov-wrap">
          <p className="pg-eyebrow">COMMUNITY REPORTS</p>
          <h1>What people are seeing — clearly labeled</h1>
          <p className="lead">
            We show what’s <b>opinion</b>, what’s <b>unverified</b>, what <b>evidence</b> exists, and what’s been
            <b> proven</b>. Unresolved claims aren’t graded true or false — they carry a live status instead.
          </p>

          <div className="rp-filters">
            <Link href="/reports?lane=citizen" className={`rp-chip${lane === 'CITIZEN' ? ' on' : ''}`}>Citizen Tips &amp; Opinions</Link>
            <Link href="/reports?lane=journalist" className={`rp-chip${lane === 'JOURNALIST' ? ' on' : ''}`}>Independent Civic Journalists</Link>
          </div>

          {lane === 'CITIZEN'
            ? <CitizenSubmit />
            : (canJournalist ? <JournalistSubmit /> : <JournalistApply />)}

          <div style={{ marginTop: 24 }}>
            {items.length === 0 ? (
              <div className="sh-card" style={{ textAlign: 'center', color: '#9aa6bd' }}>
                Nothing here yet. {lane === 'CITIZEN' ? 'Post the first one above.' : 'No published reports yet.'}
              </div>
            ) : (
              items.map((r) => (
                <Link key={r.id} href={`/reports/${r.id}`} className="rp-card">
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <LabelBadge label={r.label} />
                    <StatusBadge status={r.claimStatus} />
                  </div>
                  <h2 className="rp-head">{r.title}</h2>
                  <div className="rp-byline">By {r.displayName} · {timeAgo(r.createdAt)}
                    {r.neutralityFlags.length > 0 && <span style={{ color: '#d9a334' }}>· ⚖️ tone flagged</span>}
                  </div>
                  <p className="rp-why">{(r.whyImportant ?? r.body).slice(0, 180)}{(r.whyImportant ?? r.body).length > 180 ? '…' : ''}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </HovShell>
  );
}
