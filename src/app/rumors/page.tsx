import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { User } from 'lucide-react';
import { HovShell } from '@/components/HovShell';
import { RumorGrade } from '@/components/RumorGrade';
import { RumorSubmit } from '@/components/RumorSubmit';
import { listRumors } from '@/lib/rumors/service';
import { rumorsEnabled } from '@/lib/flags';

export const metadata: Metadata = {
  title: 'Rumors — graded for accuracy',
  description: 'Post what you’ve heard. The community grades how accurate it is, with votes and evidence.',
};
export const dynamic = 'force-dynamic';

function timeAgo(d: Date) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default async function RumorsPage() {
  if (!rumorsEnabled()) notFound(); // feature hidden — see src/lib/flags.ts
  let items: Awaited<ReturnType<typeof listRumors>>['items'] = [];
  try { ({ items } = await listRumors({})); } catch { items = []; }

  return (
    <HovShell active="rumors">
      <div className="hov-page">
        <div className="hov-wrap">
          <p className="pg-eyebrow">RUMOR CHECK</p>
          <h1>Heard a rumor? Let’s grade it.</h1>
          <p className="lead">
            Post what people are saying. Everyone can vote and add evidence — and we grade how
            accurate it is. Rumors start <b>Unverified</b> and earn a grade as facts come in.
          </p>

          <RumorSubmit />

          {items.length === 0 ? (
            <div className="sh-card" style={{ textAlign: 'center', color: '#9aa6bd' }}>
              No rumors yet. Post the first one above.
            </div>
          ) : (
            items.map((r) => (
              <Link key={r.id} href={`/rumors/${r.id}`} className="rm-card">
                <div className="who"><span className="av"><User size={15} /></span>{r.displayName} · {timeAgo(r.createdAt)}{r.topic ? ` · ${r.topic}` : ''}</div>
                <p className="rm-text">“{r.text}”</p>
                <RumorGrade grading={r.grading} />
              </Link>
            ))
          )}
        </div>
      </div>
    </HovShell>
  );
}
