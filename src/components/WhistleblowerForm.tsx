'use client';

import { useState } from 'react';

const CATEGORIES = ['Government / agency', 'Police', 'Schools', 'Courts', 'Workplace', 'Other'];

// Text-only by design. We never ask for a name, email, or phone, and we don't
// store any request metadata. Honest about limits (see the page copy).
export function WhistleblowerForm() {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(null);
    try {
      const r = await fetch('/api/whistleblower', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, category: category || undefined }) });
      const d = await r.json();
      if (r.ok && d.ok) { setDone(true); setMessage(''); setCategory(''); }
      else {
        const fe = d?.error?.details?.fieldErrors; const first = fe ? (Object.values(fe).flat()[0] as string) : null;
        setErr(first ?? d?.error?.message ?? 'Could not submit. Please try again.');
      }
    } catch { setErr('Could not submit. Please try again.'); }
    setBusy(false);
  }

  if (done) {
    return (
      <div className="wb-done">
        <h3>Received. Thank you.</h3>
        <p>Your message was encrypted and sent to our review team. We stored nothing about who you are. There is no receipt and no way to trace this back to you from our side — so for your safety, we can’t follow up unless you left a safe way to reach you inside the message.</p>
        <button className="hb hb-ghost" onClick={() => setDone(false)}>Send another</button>
      </div>
    );
  }

  return (
    <form className="wb-form" onSubmit={submit}>
      <h3>Send a secure tip</h3>
      <label className="sh-label">Topic (optional)</label>
      <select className="auth-field" value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Choose one…</option>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <label className="sh-label">What happened?</label>
      <textarea className="sh-field" style={{ minHeight: 160 }} value={message} onChange={(e) => setMessage(e.target.value)}
        placeholder="Describe what you saw. Stick to facts. Avoid details only you would know, and don’t paste anything that identifies you unless you choose to." required minLength={20} maxLength={8000} />
      {err && <div className="auth-err" style={{ marginBottom: 12 }}>{err}</div>}
      <button className="hb hb-red" type="submit" disabled={busy || message.trim().length < 20}>{busy ? 'Sending securely…' : 'Submit securely'}</button>
      <p className="wb-formnote">Text only. Please don’t upload files here — photos and documents carry hidden data that can identify you.</p>
    </form>
  );
}
