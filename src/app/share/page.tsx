'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HovShell } from '@/components/HovShell';

const TAGS = ['Workplace', 'School', 'Healthcare', 'Justice', 'Military', 'Other'];

type Result =
  | { kind: 'ok'; id: string; held: boolean; crisis: boolean; message: string }
  | { kind: 'auth' }
  | { kind: 'error'; message: string };

export default function SharePage() {
  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [anon, setAnon] = useState(true);
  const [hideLoc, setHideLoc] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const toggleTag = (t: string) =>
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  async function submit() {
    setBusy(true); setResult(null);
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: text,
          topics: tags.map((t) => t.toLowerCase()),
          anonymous: anon,
          hideLocation: hideLoc,
        }),
      });
      if (res.status === 401) { setResult({ kind: 'auth' }); return; }
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setResult({ kind: 'error', message: data?.error?.message ?? 'Something went wrong.' });
      } else {
        setResult({ kind: 'ok', ...data.data });
      }
    } catch {
      setResult({ kind: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <HovShell active="stories">
      <div className="hov-page">
        <div className="hov-wrap" style={{ maxWidth: 680 }}>
          <p className="pg-eyebrow">SHARE YOUR STORY</p>
          <h1>Your story has power</h1>
          <p className="lead">Write as much or as little as you want. You choose whether your name shows.</p>

          <div className="sh-card">
            <div className="sh-steps"><span className="on">Write</span><span>Tag</span><span>Publish</span></div>

            {result?.kind === 'ok' ? (
              <div>
                {result.crisis && (
                  <div className="auth-err" style={{ background: '#3a2a16', borderColor: '#5a4326', color: '#f3d9ad' }}>
                    It sounds like you may be going through something heavy. You are not alone —
                    please see our <Link href="/resources" style={{ color: '#ffd59e', fontWeight: 700 }}>support resources</Link>.
                    Help is available any time.
                  </div>
                )}
                <div className="auth-ok" role="status">{result.message}</div>
                {!result.held && <Link href={`/stories/${result.id}`} className="hb hb-red">View your story</Link>}
                {result.held && <Link href="/stories" className="hb hb-dark">Browse other stories</Link>}
              </div>
            ) : result?.kind === 'auth' ? (
              <div>
                <div className="auth-err">Please sign in to share your story — it keeps the community safe.</div>
                <Link href="/signup" className="hb hb-red">Create a free account</Link>{' '}
                <Link href="/login" className="hb hb-dark">Log in</Link>
              </div>
            ) : (
              <>
                {result?.kind === 'error' && <div className="auth-err">{result.message}</div>}
                <label className="sh-label" htmlFor="story">Tell your story</label>
                <textarea id="story" className="sh-field" placeholder="Tell your story…"
                  value={text} onChange={(e) => setText(e.target.value)} maxLength={8000} />

                <div className="sh-label">Add tags (helps others relate)</div>
                <div className="sh-tags">
                  {TAGS.map((t) => (
                    <button key={t} type="button" className={`sh-tagbtn${tags.includes(t) ? ' on' : ''}`}
                      aria-pressed={tags.includes(t)} onClick={() => toggleTag(t)}>{t}</button>
                  ))}
                </div>

                <div style={{ marginTop: 18 }}>
                  <div className="sh-toggle">
                    <div><b>Post anonymously</b><span>Your name will not be shown.</span></div>
                    <button type="button" className={`sh-tg${anon ? ' on' : ''}`} aria-pressed={anon}
                      aria-label="Post anonymously" onClick={() => setAnon(!anon)} />
                  </div>
                  <div className="sh-toggle">
                    <div><b>Hide location</b><span>Keep where you are private.</span></div>
                    <button type="button" className={`sh-tg${hideLoc ? ' on' : ''}`} aria-pressed={hideLoc}
                      aria-label="Hide location" onClick={() => setHideLoc(!hideLoc)} />
                  </div>
                </div>

                <div className="sh-actions">
                  <button className="hb hb-red hb-lg" disabled={busy || text.trim().length < 10} onClick={submit}>
                    {busy ? 'Sharing…' : 'Share my story'}
                  </button>
                </div>
                <p className="sh-note">
                  Every story is checked for safety. If you are in crisis, help is available any time on our{' '}
                  <Link href="/resources" style={{ color: '#e88', fontWeight: 700 }}>support page</Link>.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </HovShell>
  );
}
