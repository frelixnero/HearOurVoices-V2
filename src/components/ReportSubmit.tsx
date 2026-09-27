'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LABEL_META, POST_LABELS, type PostLabel } from '@/lib/reports/labels';

type Res = { ok: boolean; msg: string; id?: string; auth?: boolean; flags?: string[] } | null;

async function postReport(payload: unknown): Promise<Res> {
  const r = await fetch('/api/reports', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  if (r.status === 401) return { ok: false, auth: true, msg: 'Sign in to post.' };
  const data = await r.json();
  if (data.ok) return { ok: true, id: data.data.id, msg: data.data.message, flags: data.data.neutralityFlags };
  const fe = data?.error?.details?.fieldErrors;
  const first = fe ? (Object.values(fe).flat()[0] as string) : null;
  return { ok: false, msg: first ?? data?.error?.message ?? 'Could not post.' };
}

function ResultBox({ res }: { res: NonNullable<Res> }) {
  if (res.ok) return (
    <div className="auth-ok" style={{ marginTop: 12 }}>
      {res.msg}{' '}{res.id && <Link href={`/reports/${res.id}`} style={{ color: '#7fe3a6', fontWeight: 700 }}>View it →</Link>}
      {res.flags && res.flags.length > 0 && <div style={{ marginTop: 6 }}>⚖️ Flagged wording: {res.flags.join(', ')}.</div>}
    </div>
  );
  return (
    <div className="auth-err" style={{ marginTop: 12 }}>
      {res.msg}{' '}{res.auth && <><Link href="/signup" style={{ color: '#f3a29c', fontWeight: 700 }}>Sign up</Link> · <Link href="/login" style={{ color: '#f3a29c', fontWeight: 700 }}>Log in</Link></>}
    </div>
  );
}

// -------- Citizen Tips & Opinions --------
export function CitizenSubmit() {
  const [label, setLabel] = useState<string>('UNVERIFIED_TIP');
  const [f, setF] = useState({ title: '', body: '', topic: '', sourceUrl: '' });
  const [anon, setAnon] = useState(true);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Res>(null);
  const set = (k: string, v: string) => setF({ ...f, [k]: v });

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setRes(null);
    setRes(await postReport({ lane: 'CITIZEN', label, ...f, sourceUrl: f.sourceUrl || undefined, anonymous: anon }));
    setBusy(false);
  }
  return (
    <form className="sh-card" onSubmit={submit}>
      <div className="sh-label">Share a tip, opinion, concern, or firsthand account</div>
      <div className="sh-tags" style={{ marginBottom: 12 }}>
        {POST_LABELS.map((l) => (
          <button key={l} type="button" className={`sh-tagbtn${label === l ? ' on' : ''}`}
            aria-pressed={label === l} onClick={() => setLabel(l)}>{LABEL_META[l].text}</button>
        ))}
      </div>
      <div className="rp-note">This post will be publicly labeled <b>“{LABEL_META[label as PostLabel]?.text}.”</b> Unproven claims start as “Unreviewed” — no accuracy grade until they can be checked.</div>
      <input className="auth-field" placeholder="Short title" value={f.title} onChange={(e) => set('title', e.target.value)} />
      <textarea className="sh-field" placeholder="What do you want to share, ask, or report?" value={f.body} onChange={(e) => set('body', e.target.value)} maxLength={6000} />
      <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
        <input className="auth-field" style={{ marginBottom: 0, width: 'auto' }} placeholder="Topic (optional)" value={f.topic} onChange={(e) => set('topic', e.target.value)} />
        <input className="auth-field" style={{ marginBottom: 0, flex: 1, minWidth: 180 }} placeholder="Source link (optional)" value={f.sourceUrl} onChange={(e) => set('sourceUrl', e.target.value)} />
      </div>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#cfd6e4', fontSize: 14, margin: '12px 0' }}>
        <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} /> Post anonymously
      </label>
      {res && <ResultBox res={res} />}
      <div className="sh-actions"><button className="hb hb-red" disabled={busy || f.body.trim().length < 10}>{busy ? 'Posting…' : 'Post'}</button></div>
    </form>
  );
}

// -------- Independent Civic Journalist --------
const JF = [
  ['exactClaim', 'The exact claim being examined', false],
  ['videoShows', 'What the video/source directly shows (quote it faithfully)', true],
  ['videoDoesntProve', 'What it does NOT prove', true],
  ['confirmedParts', 'Which parts are confirmed / unconfirmed', true],
  ['origin', 'Where the information originated', false],
  ['whyImportant', 'Why it matters to the community', true],
  ['affectedParty', 'Person or agency named', false],
  ['affectedResponse', 'Their response — or state they did not respond', true],
  ['conflicts', 'Your conflicts of interest (or “none”)', false],
] as const;

export function JournalistSubmit() {
  const [f, setF] = useState<Record<string, string>>({ byline: '', title: '', sourceUrl: '' });
  const [pledge, setPledge] = useState(false);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Res>(null);
  const set = (k: string, v: string) => setF((c) => ({ ...c, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setRes(null);
    setRes(await postReport({ lane: 'JOURNALIST', ...f, neutralityAffirmed: pledge }));
    setBusy(false);
  }
  return (
    <form className="sh-card" onSubmit={submit}>
      <div className="sh-label">File an independent report (neutrality &amp; transparency required)</div>
      <input className="auth-field" placeholder="Your byline (public)" value={f.byline ?? ''} onChange={(e) => set('byline', e.target.value)} />
      <input className="auth-field" placeholder="Headline" value={f.title ?? ''} onChange={(e) => set('title', e.target.value)} />
      {JF.map(([k, label, big]) => (
        <div key={k}>
          <div className="sh-label">{label}</div>
          {big
            ? <textarea className="sh-field" style={{ minHeight: 70 }} value={f[k] ?? ''} onChange={(e) => set(k, e.target.value)} maxLength={6000} />
            : <input className="auth-field" value={f[k] ?? ''} onChange={(e) => set(k, e.target.value)} />}
        </div>
      ))}
      <div className="sh-label">Link the source video / records (required)</div>
      <input className="auth-field" placeholder="https://…" value={f.sourceUrl ?? ''} onChange={(e) => set('sourceUrl', e.target.value)} />
      <label className="rp-pledge">
        <input type="checkbox" checked={pledge} onChange={(e) => setPledge(e.target.checked)} />
        <span>I separated confirmed facts, analysis, opinion, and rumor; identified what is unverified; linked records; contacted the affected party (or noted no response); disclosed conflicts; and did not present edited video as the complete event.</span>
      </label>
      {res && <ResultBox res={res} />}
      <div className="sh-actions"><button className="hb hb-red hb-lg" disabled={busy || !pledge}>{busy ? 'Filing…' : 'Publish report'}</button></div>
    </form>
  );
}
