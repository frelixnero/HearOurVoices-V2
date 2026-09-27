'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';

// Interactive island on a story page: support (heart) toggle + supportive comment.
export function StoryActions({ storyId, initialCount }: { storyId: string; initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [supported, setSupported] = useState(false);
  const [comment, setComment] = useState('');
  const [anon, setAnon] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function support() {
    const res = await fetch(`/api/stories/${storyId}/support`, { method: 'POST' });
    if (res.status === 401) { setMsg('Sign in to support this story.'); return; }
    const data = await res.json();
    if (data.ok) { setCount(data.data.count); setSupported(data.data.supported); }
  }

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const res = await fetch(`/api/stories/${storyId}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: comment, anonymous: anon }),
    });
    if (res.status === 401) { setMsg('Please sign in to leave a supportive comment.'); setBusy(false); return; }
    const data = await res.json();
    setBusy(false);
    if (data.ok) {
      setComment('');
      setMsg(data.data.held
        ? 'Thank you — your comment will appear after a quick safety review.'
        : 'Thank you for your kindness. Reload to see your comment.');
    } else {
      setMsg(data?.error?.message ?? 'Could not post your comment.');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '18px 0 26px' }}>
        <button className={`hb ${supported ? 'hb-red' : 'hb-dark'}`} onClick={support}>
          <Heart size={17} fill={supported ? '#fff' : 'none'} /> Support · {count}
        </button>
      </div>

      <form className="sh-card" onSubmit={postComment}>
        <div className="sh-label">Leave a supportive comment</div>
        <textarea className="sh-field" style={{ minHeight: 90 }} placeholder="Say something kind…"
          value={comment} onChange={(e) => setComment(e.target.value)} maxLength={2000} />
        <div className="sh-toggle" style={{ borderTop: 'none', paddingTop: 6 }}>
          <div><b>Comment anonymously</b></div>
          <button type="button" className={`sh-tg${anon ? ' on' : ''}`} aria-pressed={anon}
            aria-label="Comment anonymously" onClick={() => setAnon(!anon)} />
        </div>
        {msg && <div className="auth-ok" style={{ marginBottom: 12 }}>{msg}</div>}
        <div className="sh-actions">
          <button className="hb hb-red" type="submit" disabled={busy || comment.trim().length < 2}>
            {busy ? 'Posting…' : 'Post comment'}
          </button>
        </div>
      </form>
    </div>
  );
}
