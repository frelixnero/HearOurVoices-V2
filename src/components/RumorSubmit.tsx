'use client';

import { useState } from 'react';
import Link from 'next/link';

const TOPICS = ['workplace', 'school', 'healthcare', 'justice', 'military', 'other'];

// Compose box for posting a new rumor.
export function RumorSubmit() {
  const [text, setText] = useState('');
  const [topic, setTopic] = useState('');
  const [anon, setAnon] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string; id?: string; auth?: boolean } | null>(null);

  async function post() {
    setBusy(true); setResult(null);
    const res = await fetch('/api/rumors', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, topic: topic || undefined, anonymous: anon }),
    });
    setBusy(false);
    if (res.status === 401) { setResult({ ok: false, auth: true, msg: 'Sign in to post a rumor.' }); return; }
    const data = await res.json();
    if (data.ok) { setText(''); setResult({ ok: true, id: data.data.id, msg: data.data.message }); }
    else setResult({ ok: false, msg: data?.error?.message ?? 'Could not post.' });
  }

  return (
    <div className="sh-card" style={{ marginBottom: 22 }}>
      <div className="sh-label">Heard something? Post it and let the community grade it.</div>
      <textarea className="sh-field" style={{ minHeight: 80 }} maxLength={600}
        placeholder="e.g. “I heard the new manager is cutting everyone’s hours next month.”"
        value={text} onChange={(e) => setText(e.target.value)} />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
        <select className="auth-field" style={{ width: 'auto', marginBottom: 0 }} value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="">Topic (optional)</option>
          {TOPICS.map((t) => <option key={t} value={t}>{t[0]!.toUpperCase() + t.slice(1)}</option>)}
        </select>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#cfd6e4', fontSize: 14 }}>
          <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} /> Post anonymously
        </label>
        <button className="hb hb-red" style={{ marginLeft: 'auto' }} disabled={busy || text.trim().length < 10} onClick={post}>
          {busy ? 'Posting…' : 'Post rumor'}
        </button>
      </div>
      {result && (
        <div className={result.ok ? 'auth-ok' : 'auth-err'} style={{ marginTop: 14 }}>
          {result.msg}{' '}
          {result.ok && result.id && <Link href={`/rumors/${result.id}`} style={{ color: '#7fe3a6', fontWeight: 700 }}>View it →</Link>}
          {result.auth && <><Link href="/signup" style={{ color: '#f3a29c', fontWeight: 700 }}>Sign up</Link> · <Link href="/login" style={{ color: '#f3a29c', fontWeight: 700 }}>Log in</Link></>}
        </div>
      )}
    </div>
  );
}
