'use client';

import { useEffect, useState } from 'react';
import { REMEMBRANCE_TOKENS, type TokenKey } from '@/lib/honor/labels';

interface Tribute { id: string; displayName: string; relationship: string | null; message: string; publishedAt: string | Date | null }
type Counts = { candle: number; coin: number; flag: number; stone: number; flower: number };

// A living resting place: visitors leave tokens (candle, coin, flag, stone,
// flowers) that ACCUMULATE and are there on every visit — plus a moderated
// tribute wall. Modeled on real gravesite traditions (see the coin's meaning).
export function HonorRemembrance({ heroId, heroName, initial, tributes }: {
  heroId: string; heroName: string; initial: Counts; tributes: Tribute[];
}) {
  const [counts, setCounts] = useState<Counts>(initial);
  const [mine, setMine] = useState<Record<string, boolean>>({});
  const [openMeaning, setOpenMeaning] = useState<string | null>(null);
  const [form, setForm] = useState({ displayName: '', relationship: '', message: '' });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`tokens:${heroId}`);
      if (raw) setMine(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [heroId]);

  const total = counts.candle + counts.coin + counts.flag + counts.stone + counts.flower;

  async function leave(key: TokenKey) {
    setCounts((c) => ({ ...c, [key]: (c[key] ?? 0) + 1 }));
    const nextMine = { ...mine, [key]: true };
    setMine(nextMine);
    try { localStorage.setItem(`tokens:${heroId}`, JSON.stringify(nextMine)); } catch { /* ignore */ }
    try {
      const r = await fetch(`/api/honor/${heroId}/token`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: key }) });
      const d = await r.json();
      if (d.ok) setCounts(d.data.counts);
    } catch { /* keep optimistic */ }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const r = await fetch(`/api/honor/${heroId}/tribute`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const d = await r.json(); setBusy(false);
    if (r.ok && d.ok) { setForm({ displayName: '', relationship: '', message: '' }); setMsg({ ok: true, text: 'Thank you. Your tribute will appear once it’s reviewed.' }); }
    else {
      const fe = d?.error?.details?.fieldErrors; const first = fe ? (Object.values(fe).flat()[0] as string) : null;
      setMsg({ ok: false, text: first ?? d?.error?.message ?? 'Could not submit tribute.' });
    }
  }

  return (
    <div className="hn-remembrance">
      <div className="hn-restingplace">
        <div className="hn-rp-head">
          <h3>At their resting place</h3>
          <span>{total.toLocaleString()} left in remembrance · {tributes.length} {tributes.length === 1 ? 'tribute' : 'tributes'}</span>
        </div>

        {/* Accumulated tokens — always here, never cleared. */}
        <div className="hn-tokens-left">
          {REMEMBRANCE_TOKENS.map((t) => {
            const n = counts[t.key as keyof Counts] ?? 0;
            if (n === 0) return null;
            return <span key={t.key} className="hn-token-count" title={`${n} ${t.label.toLowerCase()}`}>{t.icon} {n.toLocaleString()}</span>;
          })}
          {total === 0 && <span className="hn-token-empty">Be the first to leave something for {heroName}.</span>}
        </div>

        {/* Leave a token */}
        <div className="hn-token-actions">
          {REMEMBRANCE_TOKENS.map((t) => (
            <button key={t.key} type="button" className={`hn-token-btn${mine[t.key] ? ' left' : ''}`}
              onClick={() => leave(t.key as TokenKey)}
              onMouseEnter={() => setOpenMeaning(t.key)} onFocus={() => setOpenMeaning(t.key)}>
              <span className="ic">{t.icon}</span>{mine[t.key] ? 'Left' : t.label}
            </button>
          ))}
        </div>
        <div className="hn-token-meaning">
          {(() => {
            const t = REMEMBRANCE_TOKENS.find((x) => x.key === openMeaning) ?? REMEMBRANCE_TOKENS[1];
            return <p><b>{t.icon} {t.label}:</b> {t.meaning}</p>;
          })()}
        </div>
      </div>

      <div className="hn-sec" style={{ marginTop: 16 }}>
        <h3>Tribute wall</h3>
        {tributes.length === 0 ? (
          <p style={{ color: '#8b96ab', fontSize: 14.5, margin: 0 }}>Be the first to leave a tribute for {heroName}.</p>
        ) : (
          tributes.map((t) => (
            <div key={t.id} className="hn-tribute">
              <p>{t.message}</p>
              <div className="who">— {t.displayName}{t.relationship ? `, ${t.relationship}` : ''}</div>
            </div>
          ))
        )}
      </div>

      <form className="hn-tribute-form" onSubmit={submit}>
        <h3>Leave a tribute</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input className="auth-field" style={{ flex: 1, minWidth: 150 }} placeholder="Your name (or leave blank)" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} maxLength={80} />
          <input className="auth-field" style={{ flex: 1, minWidth: 150 }} placeholder="Relationship (e.g. Daughter, Fellow soldier)" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} maxLength={60} />
        </div>
        <textarea className="sh-field" style={{ minHeight: 80 }} placeholder={`Share a memory of ${heroName}…`} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={1000} required />
        {msg && <div className={msg.ok ? 'auth-ok' : 'auth-err'} style={{ marginBottom: 12 }}>{msg.text}</div>}
        <button className="hb hb-red" type="submit" disabled={busy || form.message.trim().length < 4}>{busy ? 'Sending…' : 'Leave tribute'}</button>
        <p style={{ fontSize: 12, color: '#8b96ab', marginTop: 8 }}>Tributes are reviewed before they appear. Please keep them respectful.</p>
      </form>
    </div>
  );
}
