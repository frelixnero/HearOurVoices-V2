import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { User } from 'lucide-react';
import { HovShell } from '@/components/HovShell';
import { StoryActions } from '@/components/StoryActions';
import { getStory } from '@/lib/stories/service';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const s = await getStory(params.id);
    if (s) return { title: s.title ?? 'A shared story', description: s.body.slice(0, 150) };
  } catch { /* fall through */ }
  return { title: 'Story' };
}

function timeAgo(d: Date) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default async function StoryPage({ params }: { params: { id: string } }) {
  let story;
  try {
    story = await getStory(params.id);
  } catch {
    story = null;
  }
  if (!story) notFound();

  return (
    <HovShell active="stories">
      <div className="hov-page">
        <div className="hov-wrap" style={{ maxWidth: 720 }}>
          <Link href="/stories" style={{ color: '#8b96ab', fontWeight: 600 }}>← All stories</Link>
          <div className="st-card" style={{ marginTop: 14 }}>
            <div className="who"><span className="av"><User size={16} /></span>{story.displayName} · {timeAgo(story.createdAt)}</div>
            {story.title && <h3 style={{ fontSize: 24 }}>{story.title}</h3>}
            <p style={{ fontSize: 16, whiteSpace: 'pre-wrap' }}>{story.body}</p>
            {story.topics.length > 0 && (
              <div className="st-tags">
                {story.topics.map((t) => <span key={t} className="st-tag">{t[0]?.toUpperCase()}{t.slice(1)}</span>)}
              </div>
            )}
          </div>

          <StoryActions storyId={story.id} initialCount={story.supportCount} />

          <h2 style={{ color: '#fff', fontSize: 20, margin: '10px 0 14px' }}>
            Support ({story.comments.length})
          </h2>
          {story.comments.length === 0 ? (
            <p style={{ color: '#8b96ab' }}>No comments yet. Be the first to offer kindness.</p>
          ) : (
            <div className="st-feed">
              {story.comments.map((c) => (
                <div key={c.id} className="st-card">
                  <div className="who"><span className="av"><User size={16} /></span>{c.displayName} · {timeAgo(c.createdAt)}</div>
                  <p style={{ margin: 0 }}>{c.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </HovShell>
  );
}
