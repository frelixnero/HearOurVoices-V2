import type { Metadata } from 'next';
import Link from 'next/link';
import { User, Heart, MessageCircle } from 'lucide-react';
import { HovShell } from '@/components/HovShell';
import { listStories } from '@/lib/stories/service';

export const metadata: Metadata = {
  title: 'Browse Stories',
  description: 'Read real experiences shared by the community — anonymously and safely.',
};
export const dynamic = 'force-dynamic';

const TOPICS = [
  ['all', 'All'], ['workplace', 'Workplace'], ['school', 'School'], ['healthcare', 'Healthcare'],
  ['justice', 'Justice'], ['military', 'Military'], ['other', 'Other'],
] as const;

function timeAgo(d: Date) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default async function StoriesPage({ searchParams }: { searchParams: { topic?: string } }) {
  const topic = searchParams.topic ?? 'all';
  let items: Awaited<ReturnType<typeof listStories>>['items'] = [];
  try {
    ({ items } = await listStories({ topic }));
  } catch {
    items = [];
  }

  return (
    <HovShell active="stories">
      <div className="hov-page">
        <div className="hov-wrap">
          <p className="pg-eyebrow">COMMUNITY STORIES</p>
          <h1>Real stories, shared safely</h1>
          <p className="lead">Every story here was shared by a real person. Be kind — someone was brave to post it.</p>

          <div className="st-filters">
            {TOPICS.map(([slug, label]) => (
              <Link key={slug} href={slug === 'all' ? '/stories' : `/stories?topic=${slug}`}
                className={`st-chip${topic === slug ? ' on' : ''}`}>{label}</Link>
            ))}
          </div>

          {items.length === 0 ? (
            <div className="sh-card" style={{ textAlign: 'center' }}>
              <p style={{ color: '#c3ccdb', fontSize: 16 }}>No stories here yet.</p>
              <p style={{ color: '#8b96ab', marginBottom: 18 }}>Be the first to share — your voice could help someone.</p>
              <Link href="/share" className="hb hb-red">Share your story</Link>
            </div>
          ) : (
            <div className="st-feed">
              {items.map((s) => (
                <Link key={s.id} href={`/stories/${s.id}`} className="st-card" style={{ display: 'block' }}>
                  <div className="who"><span className="av"><User size={16} /></span>{s.displayName} · {timeAgo(s.createdAt)}</div>
                  {s.title && <h3>{s.title}</h3>}
                  <p>{s.body.length > 240 ? s.body.slice(0, 240) + '…' : s.body}</p>
                  {s.topics.length > 0 && (
                    <div className="st-tags">
                      {s.topics.map((t) => <span key={t} className="st-tag">{t[0]?.toUpperCase()}{t.slice(1)}</span>)}
                    </div>
                  )}
                  <div className="st-rx">
                    <span><Heart size={16} style={{ verticalAlign: '-3px' }} /> {s.supportCount}</span>
                    <span><MessageCircle size={16} style={{ verticalAlign: '-3px' }} /> {s.commentCount}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <p style={{ textAlign: 'center', marginTop: 30 }}>
            <Link href="/share" className="hb hb-red hb-lg">Share your story</Link>
          </p>
        </div>
      </div>
    </HovShell>
  );
}
