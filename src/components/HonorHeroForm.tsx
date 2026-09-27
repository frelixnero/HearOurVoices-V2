'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HONOR_CATEGORIES, CATEGORY_META, BRANCHES, MEDALS, type HonorCategory } from '@/lib/honor/labels';

const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);
const commas = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

// Staff form to add a hero to the Honor Vault. Factual, respectful, sourced.
export function HonorHeroForm() {
  const [f, setF] = useState<Record<string, string>>({
    heroName: '', rank: '', branch: '', category: 'FALLEN', homeState: '', conflictOrEra: '',
    memoryLockPrimary: '', memoryLockSacrifice: '', serviceSummary: '', momentOfCourage: '', legacyImpact: '',
    medals: '', memoryPhrases: '', chainOfInfluence: '', quotes: '', keyDates: '', spotlightLevel: '0',
  });
  const [res, setRes] = useState<{ ok: boolean; msg: string; id?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setF((c) => ({ ...c, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setRes(null);
    const quotes = lines(f.quotes ?? '').map((l) => {
      const [quote, attribution] = l.split('|').map((x) => x.trim());
      return { quote: quote || l, attribution: attribution || undefined };
    }).filter((q) => q.quote);
    const keyDates = lines(f.keyDates ?? '').map((l) => {
      const [label, date] = l.split('|').map((x) => x.trim());
      return { label: label || 'Date', date: date || '' };
    }).filter((k) => k.date);
    const payload = {
      heroName: f.heroName, rank: f.rank || undefined, branch: f.branch || undefined,
      category: f.category, homeState: f.homeState || undefined, conflictOrEra: f.conflictOrEra || undefined,
      memoryLockPrimary: f.memoryLockPrimary, memoryLockSacrifice: f.memoryLockSacrifice,
      serviceSummary: f.serviceSummary || undefined, momentOfCourage: f.momentOfCourage || undefined,
      legacyImpact: f.legacyImpact || undefined,
      medals: commas(f.medals ?? ''), memoryPhrases: lines(f.memoryPhrases ?? ''),
      chainOfInfluence: lines(f.chainOfInfluence ?? ''), quotes, keyDates,
      spotlightLevel: Number(f.spotlightLevel || 0),
    };
    const r = await fetch('/api/honor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setBusy(false);
    const d = await r.json();
    if (d.ok) setRes({ ok: true, msg: `Hero added (spotlight level ${d.data.spotlightLevel}).`, id: d.data.id });
    else {
      const fe = d?.error?.details?.fieldErrors; const first = fe ? (Object.values(fe).flat()[0] as string) : null;
      setRes({ ok: false, msg: first ?? d?.error?.message ?? 'Could not add hero.' });
    }
  }

  return (
    <form className="adm-item" style={{ maxWidth: 640 }} onSubmit={submit}>
      <h4>Add a hero to the Honor Vault</h4>
      <p style={{ color: '#8b96ab', fontSize: 13 }}>Factual and respectful. Use official citations (medal citations, service records) and family statements where possible.</p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
        <input className="auth-field" style={{ flex: 2, minWidth: 160, marginBottom: 0 }} placeholder="Name" value={f.heroName} onChange={(e) => set('heroName', e.target.value)} />
        <input className="auth-field" style={{ width: 120, marginBottom: 0 }} placeholder="Rank" value={f.rank} onChange={(e) => set('rank', e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
        <select className="auth-field" style={{ width: 'auto', marginBottom: 0 }} value={f.category} onChange={(e) => set('category', e.target.value)}>
          {HONOR_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_META[c as HonorCategory].text}</option>)}
        </select>
        <select className="auth-field" style={{ width: 'auto', marginBottom: 0 }} value={f.branch} onChange={(e) => set('branch', e.target.value)}>
          <option value="">Branch…</option>
          {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select className="auth-field" style={{ width: 'auto', marginBottom: 0 }} value={f.spotlightLevel} onChange={(e) => set('spotlightLevel', e.target.value)}>
          <option value="0">Normal</option>
          <option value="2">Spotlight</option>
          <option value="3">★ Never forget</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
        <input className="auth-field" style={{ flex: 1, minWidth: 150 }} placeholder="Conflict / era (e.g. Afghanistan)" value={f.conflictOrEra} onChange={(e) => set('conflictOrEra', e.target.value)} />
        <input className="auth-field" style={{ flex: 1, minWidth: 150 }} placeholder="Home state" value={f.homeState} onChange={(e) => set('homeState', e.target.value)} />
      </div>

      <div className="sh-label">Memory lock — what they did (one clear sentence)</div>
      <textarea className="sh-field" style={{ minHeight: 54 }} value={f.memoryLockPrimary} onChange={(e) => set('memoryLockPrimary', e.target.value)} />
      <div className="sh-label">Memory lock — what they gave (one clear sentence)</div>
      <textarea className="sh-field" style={{ minHeight: 54 }} value={f.memoryLockSacrifice} onChange={(e) => set('memoryLockSacrifice', e.target.value)} />

      <input className="auth-field" style={{ marginTop: 10 }} placeholder="Medals (comma-separated)" value={f.medals} onChange={(e) => set('medals', e.target.value)} />
      <p style={{ fontSize: 12, color: '#8b96ab', margin: '6px 0 0' }}>Common: {MEDALS.slice(0, 8).join(', ')}…</p>

      <div className="sh-label">Service summary (≤25 words)</div>
      <textarea className="sh-field" style={{ minHeight: 44 }} value={f.serviceSummary} onChange={(e) => set('serviceSummary', e.target.value)} />
      <div className="sh-label">The moment of courage</div>
      <textarea className="sh-field" style={{ minHeight: 60 }} value={f.momentOfCourage} onChange={(e) => set('momentOfCourage', e.target.value)} />
      <div className="sh-label">Legacy &amp; impact</div>
      <textarea className="sh-field" style={{ minHeight: 60 }} value={f.legacyImpact} onChange={(e) => set('legacyImpact', e.target.value)} />

      <div className="sh-label">Memory-boost phrases (one per line — short, sticky)</div>
      <textarea className="sh-field" style={{ minHeight: 44 }} placeholder={'He ran toward danger.\nHer courage never faded.'} value={f.memoryPhrases} onChange={(e) => set('memoryPhrases', e.target.value)} />
      <div className="sh-label">Chain of influence (one per line — unit, mission, community, family, future)</div>
      <textarea className="sh-field" style={{ minHeight: 44 }} value={f.chainOfInfluence} onChange={(e) => set('chainOfInfluence', e.target.value)} />

      <div className="sh-label">Quotes — one per line: <code style={{ color: '#7fb0e8' }}>Quote | Attribution</code></div>
      <textarea className="sh-field" style={{ minHeight: 54 }} placeholder="He’d give you the shirt off his back. | His sister, Dana" value={f.quotes} onChange={(e) => set('quotes', e.target.value)} />

      <div className="sh-label">Remembered on — one per line: <code style={{ color: '#7fb0e8' }}>Label | Date</code> (e.g. Date of sacrifice | 2011-06-14)</div>
      <textarea className="sh-field" style={{ minHeight: 44 }} placeholder="Birthday | 03-22" value={f.keyDates} onChange={(e) => set('keyDates', e.target.value)} />

      {res && <div className={res.ok ? 'auth-ok' : 'auth-err'} style={{ marginTop: 12 }}>{res.msg} {res.ok && res.id && <Link href={`/honor/${res.id}`} style={{ color: '#7fe3a6', fontWeight: 700 }}>View →</Link>}</div>}
      <div className="sh-actions"><button className="hb hb-red" disabled={busy}>{busy ? 'Adding…' : 'Add to the Honor Vault'}</button></div>
    </form>
  );
}
