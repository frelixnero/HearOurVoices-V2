'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CASE_STATUSES, CASE_STATUS_META, type ScoreTag } from '@/lib/vault/labels';

const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);
const commas = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

// Shorthand → score tag so staff can type GOOD/BAD/INFO in a pipe-delimited line.
const SCORE: Record<string, ScoreTag> = {
  GOOD: 'GOOD_MOVE', GOOD_MOVE: 'GOOD_MOVE',
  BAD: 'BAD_MOVE', BAD_MOVE: 'BAD_MOVE',
  INFO: 'NEEDS_INFO', NEEDS_INFO: 'NEEDS_INFO', NEEDS: 'NEEDS_INFO',
};
const SRC_LABELS = ['DOCUMENTED', 'RECORDED', 'MISSING', 'UNVERIFIED'];

// Staff form to add a Justice Vault case. Legal-safe by design: facts only,
// state charges/verdicts exactly, judge actions (not identity). Score/spotlight
// are computed server-side from the justice-gap score, flags and open questions.
export function JusticeCaseForm() {
  const [f, setF] = useState<Record<string, string>>({
    victimName: '', victimAge: '', location: '', dateOfIncident: '', caseType: '',
    status: 'ACTIVE', justiceGapScore: '0',
    memoryLockPrimary: '', memoryLockFailure: '',
    whatWasLost: '', favoriteActivities: '', personalityWords: '', anchorPhrases: '',
    timeline: '', actions: '', questions: '', flags: '', sources: '',
  });
  const [res, setRes] = useState<{ ok: boolean; msg: string; id?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setF((c) => ({ ...c, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setRes(null);

    const timeline = lines(f.timeline ?? '').map((l) => {
      const [date, label, score, ...rest] = l.split('|').map((x) => x.trim());
      return { date: date || undefined, label: label || 'Event', scoreTag: SCORE[(score || '').toUpperCase()], description: rest.join(' | ') || label || 'Event' };
    });
    const actions = lines(f.actions ?? '').map((l) => {
      const [score, actorType, actorName, ...rest] = l.split('|').map((x) => x.trim());
      return { scoreTag: SCORE[(score || '').toUpperCase()] ?? 'NEEDS_INFO', actorType: actorType || 'Authority', actorName: actorName || undefined, description: rest.join(' | ') || actorType || 'Action' };
    });
    const questions = lines(f.questions ?? '').map((l) => {
      const [target, ...rest] = l.split('|').map((x) => x.trim());
      return { targetAuthority: target || 'Unknown authority', questionText: rest.join(' | ') || target, status: 'Unanswered' };
    });
    const flags = lines(f.flags ?? '').map((l) => {
      const [flag, ...rest] = l.split('|').map((x) => x.trim());
      return { flag: flag || 'Contradiction', reason: rest.join(' | ') || flag };
    });
    const sources = lines(f.sources ?? '').map((l) => {
      const [label, title, url] = l.split('|').map((x) => x.trim());
      return { label: SRC_LABELS.includes((label || '').toUpperCase()) ? (label!.toUpperCase()) : 'UNVERIFIED', title: title || label || 'Source', url: url || undefined };
    }).filter((s) => s.title);

    const payload = {
      victimName: f.victimName, victimAge: f.victimAge ? Number(f.victimAge) : undefined,
      location: f.location || undefined, dateOfIncident: f.dateOfIncident || undefined,
      caseType: f.caseType, status: f.status, justiceGapScore: Number(f.justiceGapScore || 0),
      memoryLockPrimary: f.memoryLockPrimary, memoryLockFailure: f.memoryLockFailure,
      whatWasLost: f.whatWasLost || undefined, favoriteActivities: f.favoriteActivities || undefined,
      personalityWords: commas(f.personalityWords ?? ''), anchorPhrases: lines(f.anchorPhrases ?? ''),
      timeline, actions, questions, flags, sources,
    };
    const r = await fetch('/api/vault', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setBusy(false);
    const d = await r.json();
    if (d.ok) setRes({ ok: true, msg: `Case added (spotlight level ${d.data.spotlightLevel}).`, id: d.data.id });
    else {
      const fe = d?.error?.details?.fieldErrors; const first = fe ? (Object.values(fe).flat()[0] as string) : null;
      setRes({ ok: false, msg: first ?? d?.error?.message ?? 'Could not add case.' });
    }
  }

  return (
    <form className="adm-item" style={{ maxWidth: 640 }} onSubmit={submit}>
      <h4>Add a Justice Vault case</h4>
      <p style={{ color: '#8b96ab', fontSize: 13 }}>Facts only. State charges/verdicts exactly. Judge actions, never label a person. Use verified public records.</p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
        <input className="auth-field" style={{ flex: 2, minWidth: 160, marginBottom: 0 }} placeholder="Name" value={f.victimName} onChange={(e) => set('victimName', e.target.value)} />
        <input className="auth-field" style={{ width: 80, marginBottom: 0 }} placeholder="Age" value={f.victimAge} onChange={(e) => set('victimAge', e.target.value)} />
        <select className="auth-field" style={{ width: 'auto', marginBottom: 0 }} value={f.status} onChange={(e) => set('status', e.target.value)}>
          {CASE_STATUSES.map((s) => <option key={s} value={s}>{CASE_STATUS_META[s].text}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
        <input className="auth-field" style={{ flex: 1, minWidth: 150 }} placeholder="Case type (e.g. Unsolved homicide)" value={f.caseType} onChange={(e) => set('caseType', e.target.value)} />
        <input className="auth-field" style={{ flex: 1, minWidth: 150 }} placeholder="Location" value={f.location} onChange={(e) => set('location', e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input className="auth-field" style={{ flex: 1, minWidth: 150 }} placeholder="Date of incident (e.g. Mar 2019)" value={f.dateOfIncident} onChange={(e) => set('dateOfIncident', e.target.value)} />
        <input className="auth-field" style={{ width: 150 }} type="number" min={0} max={100} placeholder="Justice gap 0–100" value={f.justiceGapScore} onChange={(e) => set('justiceGapScore', e.target.value)} />
      </div>

      <div className="sh-label">Memory lock — what happened (one clear sentence)</div>
      <textarea className="sh-field" style={{ minHeight: 54 }} value={f.memoryLockPrimary} onChange={(e) => set('memoryLockPrimary', e.target.value)} />
      <div className="sh-label">Memory lock — what failed (one clear sentence)</div>
      <textarea className="sh-field" style={{ minHeight: 54 }} value={f.memoryLockFailure} onChange={(e) => set('memoryLockFailure', e.target.value)} />

      <div className="sh-label">Who they were (what was lost)</div>
      <textarea className="sh-field" style={{ minHeight: 54 }} value={f.whatWasLost} onChange={(e) => set('whatWasLost', e.target.value)} />
      <input className="auth-field" style={{ marginTop: 10 }} placeholder="Loved (e.g. painting, her sisters, soccer)" value={f.favoriteActivities} onChange={(e) => set('favoriteActivities', e.target.value)} />
      <input className="auth-field" placeholder="Personality words (comma-separated)" value={f.personalityWords} onChange={(e) => set('personalityWords', e.target.value)} />
      <div className="sh-label">Anchor phrases (one per line — short, human, memorable)</div>
      <textarea className="sh-field" style={{ minHeight: 44 }} value={f.anchorPhrases} onChange={(e) => set('anchorPhrases', e.target.value)} />

      <div className="sh-label">Timeline — one per line: <code style={{ color: '#7fb0e8' }}>DATE | LABEL | SCORE | Description</code> (SCORE = GOOD/BAD/INFO or blank)</div>
      <textarea className="sh-field" style={{ minHeight: 70 }} placeholder="Mar 2019 | Incident | | Reported missing after leaving work" value={f.timeline} onChange={(e) => set('timeline', e.target.value)} />

      <div className="sh-label">Authority actions — one per line: <code style={{ color: '#7fb0e8' }}>SCORE | Actor type | Actor name | Description</code></div>
      <textarea className="sh-field" style={{ minHeight: 70 }} placeholder="BAD | Police dept | | Case reassigned three times in a year" value={f.actions} onChange={(e) => set('actions', e.target.value)} />

      <div className="sh-label">Open questions — one per line: <code style={{ color: '#7fb0e8' }}>Target authority | Question</code></div>
      <textarea className="sh-field" style={{ minHeight: 54 }} placeholder="District Attorney | Why were the charges not pursued?" value={f.questions} onChange={(e) => set('questions', e.target.value)} />

      <div className="sh-label">Contradiction markers — one per line: <code style={{ color: '#7fb0e8' }}>Flag | Reason</code></div>
      <textarea className="sh-field" style={{ minHeight: 54 }} placeholder="Report timeline conflict | Two official statements give different times" value={f.flags} onChange={(e) => set('flags', e.target.value)} />

      <div className="sh-label">Sources — one per line: <code style={{ color: '#7fb0e8' }}>LABEL | Title | URL</code> (LABEL = DOCUMENTED/RECORDED/MISSING/UNVERIFIED)</div>
      <textarea className="sh-field" style={{ minHeight: 54 }} placeholder="DOCUMENTED | Police report #1234 | https://…" value={f.sources} onChange={(e) => set('sources', e.target.value)} />

      {res && <div className={res.ok ? 'auth-ok' : 'auth-err'} style={{ marginTop: 12 }}>{res.msg} {res.ok && res.id && <Link href={`/vault/${res.id}`} style={{ color: '#7fe3a6', fontWeight: 700 }}>View →</Link>}</div>}
      <div className="sh-actions"><button className="hb hb-red" disabled={busy}>{busy ? 'Adding…' : 'Add to the Vault'}</button></div>
    </form>
  );
}
