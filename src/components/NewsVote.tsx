'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NewsJudgment } from './NewsJudgment';
import { VERDICT_META, VOTE_REASONS, VERDICTS, type Judgment, type CivicVerdict } from '@/lib/civic/labels';

// Public-judgment voting: pick a verdict, then a required reason (or write one).
export function NewsVote({ newsId, initial, initialVerdict, initialReason }: {
  newsId: string; initial: Judgment; initialVerdict?: string | null; initialReason?: string | null;
}) {
  const [judgment, setJudgment] = useState(initial);
  const [verdict, setVerdict] = useState<CivicVerdict | null>((initialVerdict as CivicVerdict) ?? null);
  const [reason, setReason] = useState(initialReason ?? '');
  const [custom, setCustom] = useState(initialReason && !VOTE_REASONS.includes(initialReason as never) ? initialReason : '');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    const finalReason = custom.trim() || reason;
    if (!verdict) { setMsg('Pick Good Move, Bad Move, or Needs Info first.'); return; }
    if (finalReason.trim().length < 3) { setMsg('Please choose or write a reason.'); return; }
    setBusy(true); setMsg(null);
    const r = await fetch(`/api/news/${newsId}/vote`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verdict, reason: finalReason }),
    });
    setBusy(false);
    if (r.status === 401) { setMsg('AUTH'); return; }
    const d = await r.json();
    if (d.ok) { setJudgment(d.data.judgment); setMsg('Thanks — your judgment was counted.'); }
    else setMsg(d?.error?.message ?? 'Could not record your judgment.');
  }

  return (
    <div>
      <div style={{ margin: '10px 0 14px' }}><NewsJudgment judgment={judgment} /></div>
      <p style={{ color: '#9aa6bd', fontSize: 14, margin: '0 0 8px' }}>Your judgment (a reason is required):</p>
      <div className="nw-vote">
        {VERDICTS.map((v) => {
          const m = VERDICT_META[v];
          return (
            <button key={v} className={`nw-vbtn${verdict === v ? ' on' : ''}`} style={verdict === v ? { color: m.color } : undefined}
              onClick={() => setVerdict(v)} aria-pressed={verdict === v}>
              <span>{m.emoji} {m.text}</span>
              <small>{v === 'GOOD_MOVE' ? 'followed process, helped public' : v === 'BAD_MOVE' ? 'broke process or hid info' : 'evidence missing / unclear'}</small>
            </button>
          );
        })}
      </div>
      <div className="nw-reasons">
        {VOTE_REASONS.map((r) => (
          <button key={r} className={`nw-reason${reason === r && !custom ? ' on' : ''}`}
            onClick={() => { setReason(r); setCustom(''); }}>{r}</button>
        ))}
      </div>
      <input className="auth-field" placeholder="…or write your own reason" value={custom}
        onChange={(e) => setCustom(e.target.value)} maxLength={300} />
      {msg === 'AUTH' ? (
        <div className="auth-err">Sign in to add your judgment. <Link href="/signup" style={{ color: '#f3a29c', fontWeight: 700 }}>Sign up</Link> · <Link href="/login" style={{ color: '#f3a29c', fontWeight: 700 }}>Log in</Link></div>
      ) : msg ? <div className="auth-ok">{msg}</div> : null}
      <div className="sh-actions"><button className="hb hb-red" onClick={submit} disabled={busy}>{busy ? 'Submitting…' : 'Submit judgment'}</button></div>
    </div>
  );
}
