'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { RumorGrade } from './RumorGrade';
import type { GradeResult } from '@/lib/rumors/grading';

// Vote + add-evidence island for a rumor detail page. Updates the grade live.
export function RumorActions({
  rumorId, initialGrading, initialVote,
}: { rumorId: string; initialGrading: GradeResult; initialVote: string | null }) {
  const [grading, setGrading] = useState(initialGrading);
  const [myVote, setMyVote] = useState<string | null>(initialVote);
  const [msg, setMsg] = useState<string | null>(null);
  const [stance, setStance] = useState<'supports' | 'refutes'>('supports');
  const [note, setNote] = useState('');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [evMsg, setEvMsg] = useState<string | null>(null);

  async function vote(v: 'accurate' | 'inaccurate') {
    const res = await fetch(`/api/rumors/${rumorId}/vote`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vote: v }),
    });
    if (res.status === 401) { setMsg('Sign in to help grade this rumor.'); return; }
    const data = await res.json();
    if (data.ok) { setGrading(data.data.grading); setMyVote(data.data.myVote); setMsg(null); }
  }

  async function addEvidence(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setEvMsg(null);
    const res = await fetch(`/api/rumors/${rumorId}/evidence`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stance, note, url: url || undefined, anonymous: true }),
    });
    setBusy(false);
    if (res.status === 401) { setEvMsg('Sign in to add evidence.'); return; }
    const data = await res.json();
    if (data.ok) { setNote(''); setUrl(''); setEvMsg('Thanks — evidence added. Reload to see it in the list.'); }
    else setEvMsg(data?.error?.message ?? 'Could not add evidence.');
  }

  return (
    <div>
      <div style={{ margin: '16px 0' }}><RumorGrade grading={grading} /></div>

      <p style={{ color: '#9aa6bd', fontSize: 14, margin: '0 0 8px' }}>Is this accurate?</p>
      <div className="rm-votes">
        <button className={`rm-vote acc${myVote === 'accurate' ? ' on' : ''}`} onClick={() => vote('accurate')}>
          <Check size={17} /> Accurate
        </button>
        <button className={`rm-vote inacc${myVote === 'inaccurate' ? ' on' : ''}`} onClick={() => vote('inaccurate')}>
          <X size={17} /> Inaccurate
        </button>
      </div>
      {msg && <div className="auth-err" style={{ marginTop: 12 }}>{msg}</div>}

      <form className="sh-card" style={{ marginTop: 20 }} onSubmit={addEvidence}>
        <div className="sh-label">Add evidence (helps grade it accurately)</div>
        <div className="rm-votes" style={{ marginBottom: 10 }}>
          <button type="button" className={`rm-vote acc${stance === 'supports' ? ' on' : ''}`} onClick={() => setStance('supports')}>Supports</button>
          <button type="button" className={`rm-vote inacc${stance === 'refutes' ? ' on' : ''}`} onClick={() => setStance('refutes')}>Refutes</button>
        </div>
        <textarea className="sh-field" style={{ minHeight: 80 }} placeholder="What do you know? Add a fact or context…"
          value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />
        <input className="auth-field" style={{ marginTop: 10 }} placeholder="Source link (optional)"
          value={url} onChange={(e) => setUrl(e.target.value)} />
        {evMsg && <div className="auth-ok" style={{ marginBottom: 12 }}>{evMsg}</div>}
        <div className="sh-actions">
          <button className="hb hb-red" type="submit" disabled={busy || note.trim().length < 3}>
            {busy ? 'Adding…' : 'Add evidence'}
          </button>
        </div>
      </form>
    </div>
  );
}
