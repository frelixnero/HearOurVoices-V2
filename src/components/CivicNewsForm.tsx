'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SCOPES, SCOPE_META, AUTHORITIES, AUTHORITY_META, PROCESS_CHECKS, IMPACT_META, EVIDENCE_LABELS, ACTION_TYPES, ACTION_META, type AuthorityCategory, type ActionType } from '@/lib/civic/labels';

const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);
type Tri = 'true' | 'false' | 'unknown';
const toBool = (t: Tri) => (t === 'true' ? true : t === 'false' ? false : null);

// Staff form to publish a civic-news item. All the accountability fields:
// action summary, why it matters, pros/cons, alternatives, power map, process
// check, impact, and evidence sources.
export function CivicNewsForm() {
  const [f, setF] = useState<Record<string, string>>({
    scope: 'LOCAL', authority: 'COUNCIL', title: '', actorType: '', actorName: '', actionType: '', jurisdiction: '',
    whatHappened: '', whyItMatters: '', nextStep: '', pros: '', cons: '', alternatives: '', powerMap: '',
    impactLevel: '2', sources: '',
  });
  const [proc, setProc] = useState<Record<string, Tri>>(Object.fromEntries(PROCESS_CHECKS.map((c) => [c.key, 'unknown'])));
  const [res, setRes] = useState<{ ok: boolean; msg: string; id?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setF((c) => ({ ...c, [k]: v }));

  // AI draft-assist: paste raw source text → Grok drafts the plain-language
  // breakdown into the fields below for the moderator to review and edit.
  const [raw, setRaw] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [draftMsg, setDraftMsg] = useState<string | null>(null);
  async function draft() {
    setDrafting(true); setDraftMsg(null);
    try {
      const r = await fetch('/api/admin/news/draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rawText: raw, actionType: f.actionType || undefined }) });
      const d = await r.json();
      if (r.ok && d.ok) {
        const dr = d.data.draft;
        setF((c) => ({
          ...c,
          title: c.title || dr.title || '',
          whatHappened: dr.whatHappened || c.whatHappened,
          whyItMatters: dr.whyItMatters || c.whyItMatters,
          nextStep: dr.nextStep || c.nextStep,
          pros: (dr.pros ?? []).join('\n') || c.pros,
          cons: (dr.cons ?? []).join('\n') || c.cons,
        }));
        setDraftMsg('Draft filled in below. Review every line and fix anything before publishing.');
      } else {
        setDraftMsg(d?.error?.message ?? 'Could not draft.');
      }
    } catch { setDraftMsg('Could not draft. Try again.'); }
    setDrafting(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setRes(null);
    const sources = lines(f.sources ?? '').map((l) => {
      const [label, title, url] = l.split('|').map((x) => x.trim());
      return { label: EVIDENCE_LABELS.includes(label as never) ? label : 'UNVERIFIED', title: title || label || 'Source', url: url || undefined };
    }).filter((s) => s.title);
    const payload = {
      scope: f.scope, authority: f.authority, title: f.title, actorType: f.actorType,
      actorName: f.actorName || undefined, actionType: f.actionType || undefined, jurisdiction: f.jurisdiction || undefined,
      whatHappened: f.whatHappened, whyItMatters: f.whyItMatters, nextStep: f.nextStep || undefined,
      pros: lines(f.pros ?? ''), cons: lines(f.cons ?? ''),
      alternatives: lines(f.alternatives ?? ''), powerMap: lines(f.powerMap ?? ''),
      process: Object.fromEntries(PROCESS_CHECKS.map((c) => [c.key, toBool(proc[c.key]!)])),
      impactLevel: Number(f.impactLevel), sources,
    };
    const r = await fetch('/api/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setBusy(false);
    const d = await r.json();
    if (d.ok) { setRes({ ok: true, msg: 'Published.', id: d.data.id }); }
    else {
      const fe = d?.error?.details?.fieldErrors; const first = fe ? (Object.values(fe).flat()[0] as string) : null;
      setRes({ ok: false, msg: first ?? d?.error?.message ?? 'Could not publish.' });
    }
  }

  return (
    <form className="adm-item" style={{ maxWidth: 640 }} onSubmit={submit}>
      <h4>Add civic news</h4>
      <p style={{ color: '#8b96ab', fontSize: 13 }}>Post factual, sourced items. The verdict comes from public votes — keep it neutral. Use primary sources.</p>

      <div className="nw-draft">
        <div className="sh-label" style={{ marginTop: 0 }}>✨ Draft with AI (optional)</div>
        <p style={{ color: '#8b96ab', fontSize: 12.5, margin: '0 0 8px' }}>Paste the bill text, meeting record, or press release. Grok drafts a 5th-grade breakdown into the fields below — then you review and fix before publishing.</p>
        <textarea className="sh-field" style={{ minHeight: 90 }} placeholder="Paste raw government text here…" value={raw} onChange={(e) => setRaw(e.target.value)} />
        <button type="button" className="hb hb-ghost" disabled={drafting || raw.trim().length < 40} onClick={draft}>{drafting ? 'Drafting…' : '✨ Draft breakdown'}</button>
        {draftMsg && <p style={{ fontSize: 12.5, color: draftMsg.startsWith('Draft filled') ? '#5fd39a' : '#e0b0aa', marginTop: 8 }}>{draftMsg}</p>}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
        <select className="auth-field" style={{ width: 'auto', marginBottom: 0 }} value={f.scope} onChange={(e) => set('scope', e.target.value)}>
          {SCOPES.map((s) => <option key={s} value={s}>{SCOPE_META[s].text}</option>)}
        </select>
        <select className="auth-field" style={{ width: 'auto', marginBottom: 0 }} value={f.authority} onChange={(e) => set('authority', e.target.value)}>
          {AUTHORITIES.map((a) => <option key={a} value={a}>{AUTHORITY_META[a as AuthorityCategory].text}</option>)}
        </select>
        <select className="auth-field" style={{ width: 'auto', marginBottom: 0 }} value={f.impactLevel} onChange={(e) => set('impactLevel', e.target.value)}>
          {IMPACT_META.map((m, i) => <option key={i} value={i}>Impact {i} — {m}</option>)}
        </select>
      </div>
      <p style={{ fontSize: 12, color: '#8b96ab', margin: '8px 0 0' }}>Evidence to pull: {AUTHORITY_META[f.authority as AuthorityCategory].evidence}</p>

      <input className="auth-field" style={{ marginTop: 12 }} placeholder="Headline" value={f.title} onChange={(e) => set('title', e.target.value)} />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input className="auth-field" style={{ flex: 1, minWidth: 150 }} placeholder="Actor type (e.g. City Council)" value={f.actorType} onChange={(e) => set('actorType', e.target.value)} />
        <input className="auth-field" style={{ flex: 1, minWidth: 150 }} placeholder="Actor name (optional)" value={f.actorName} onChange={(e) => set('actorName', e.target.value)} />
      </div>
      <input className="auth-field" placeholder="Jurisdiction (e.g. Riverbend, ZZ)" value={f.jurisdiction} onChange={(e) => set('jurisdiction', e.target.value)} />

      <div className="sh-label">Action type (plain-language module)</div>
      <select className="auth-field" value={f.actionType} onChange={(e) => set('actionType', e.target.value)}>
        <option value="">— None —</option>
        {ACTION_TYPES.map((a) => <option key={a} value={a}>{ACTION_META[a as ActionType].icon} {ACTION_META[a as ActionType].label}</option>)}
      </select>

      <div className="sh-label">What happened (plain, 5th-grade facts)</div>
      <textarea className="sh-field" style={{ minHeight: 80 }} value={f.whatHappened} onChange={(e) => set('whatHappened', e.target.value)} />
      <div className="sh-label">What it means (kid-friendly)</div>
      <textarea className="sh-field" style={{ minHeight: 60 }} value={f.whyItMatters} onChange={(e) => set('whyItMatters', e.target.value)} />
      <div className="sh-label">What happens next (optional — a default is used if blank)</div>
      <input className="auth-field" placeholder={f.actionType ? ACTION_META[f.actionType as ActionType].nextHint : 'e.g. The council votes next Tuesday.'} value={f.nextStep} onChange={(e) => set('nextStep', e.target.value)} />

      {([['pros', 'Pros (one per line)'], ['cons', 'Cons (one per line)'], ['alternatives', 'Better options they could have taken (one per line)'], ['powerMap', 'Who could have stopped/changed it (one per line, e.g. "Mayor — could have vetoed")']] as const).map(([k, label]) => (
        <div key={k}><div className="sh-label">{label}</div>
          <textarea className="sh-field" style={{ minHeight: 54 }} value={f[k] ?? ''} onChange={(e) => set(k, e.target.value)} /></div>
      ))}

      <div className="sh-label">Process check</div>
      {PROCESS_CHECKS.map((c) => (
        <div key={c.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, margin: '4px 0' }}>
          <span style={{ fontSize: 14, color: '#c3ccdb' }}>{c.label}</span>
          <select className="auth-field" style={{ width: 'auto', marginBottom: 0 }} value={proc[c.key]} onChange={(e) => setProc((p) => ({ ...p, [c.key]: e.target.value as Tri }))}>
            <option value="unknown">Unknown</option><option value="true">Yes</option><option value="false">No</option>
          </select>
        </div>
      ))}

      <div className="sh-label">Evidence sources — one per line: <code style={{ color: '#7fb0e8' }}>LABEL | Title | URL</code> (LABEL = DOCUMENTED/RECORDED/MISSING/UNVERIFIED)</div>
      <textarea className="sh-field" style={{ minHeight: 60 }} placeholder="RECORDED | Council meeting video | https://…" value={f.sources ?? ''} onChange={(e) => set('sources', e.target.value)} />

      {res && <div className={res.ok ? 'auth-ok' : 'auth-err'} style={{ marginTop: 12 }}>{res.msg} {res.ok && res.id && <Link href={`/news/${res.id}`} style={{ color: '#7fe3a6', fontWeight: 700 }}>View →</Link>}</div>}
      <div className="sh-actions"><button className="hb hb-red" disabled={busy}>{busy ? 'Publishing…' : 'Publish civic news'}</button></div>
    </form>
  );
}
