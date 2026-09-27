import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { User } from 'lucide-react';
import { HovShell } from '@/components/HovShell';
import { RumorActions } from '@/components/RumorActions';
import { getRumor } from '@/lib/rumors/service';
import { getCurrentUser } from '@/lib/auth/session';
import { rumorsEnabled } from '@/lib/flags';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const r = await getRumor(params.id);
    if (r) return { title: 'Rumor check', description: r.text.slice(0, 150) };
  } catch { /* ignore */ }
  return { title: 'Rumor' };
}

function timeAgo(d: Date) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default async function RumorPage({ params }: { params: { id: string } }) {
  if (!rumorsEnabled()) notFound(); // feature hidden — see src/lib/flags.ts
  const user = await getCurrentUser().catch(() => null);
  let rumor;
  try { rumor = await getRumor(params.id, user?.id); } catch { rumor = null; }
  if (!rumor) notFound();

  return (
    <HovShell active="rumors">
      <div className="hov-page">
        <div className="hov-wrap" style={{ maxWidth: 720 }}>
          <Link href="/rumors" style={{ color: '#8b96ab', fontWeight: 600 }}>← All rumors</Link>

          <div className="rm-card" style={{ marginTop: 14 }}>
            <div className="who"><span className="av"><User size={15} /></span>{rumor.displayName} · {timeAgo(rumor.createdAt)}{rumor.topic ? ` · ${rumor.topic}` : ''}</div>
            <p className="rm-text" style={{ fontSize: 20 }}>“{rumor.text}”</p>
          </div>

          {rumor.grading.source === 'reviewer' && rumor.officialRationale && (
            <div className="rm-note"><b>Reviewer verdict:</b> {rumor.officialRationale}</div>
          )}

          <RumorActions rumorId={rumor.id} initialGrading={rumor.grading} initialVote={rumor.myVote} />

          <h2 style={{ color: '#fff', fontSize: 20, margin: '26px 0 14px' }}>
            Evidence ({rumor.evidence.length})
          </h2>
          {rumor.evidence.length === 0 ? (
            <p style={{ color: '#8b96ab' }}>No evidence yet. Add what you know above.</p>
          ) : (
            rumor.evidence.map((e) => (
              <div key={e.id} className="rm-ev">
                <span className={`st ${e.stance === 'supports' ? 'sup' : 'ref'}`}>
                  {e.stance === 'supports' ? '✓ Supports' : '✕ Refutes'}
                </span>
                <p>{e.note}</p>
                {e.url && <a href={e.url} target="_blank" rel="noreferrer">Source ↗</a>}
              </div>
            ))
          )}
        </div>
      </div>
    </HovShell>
  );
}
