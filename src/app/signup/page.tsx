'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HovShell } from '@/components/HovShell';
import { HovLogo } from '@/components/HovLogo';

export default function SignupPage() {
  const [form, setForm] = useState({ displayName: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        const detail = Array.isArray(data?.error?.details) ? data.error.details.join(' ') : '';
        setError(`${data?.error?.message ?? 'Could not create your account.'} ${detail}`.trim());
      } else {
        setOk(true);
        setTimeout(() => { window.location.href = '/stories'; }, 900);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <HovShell active="signup">
      <div className="auth-wrap">
        <form className="auth-card" onSubmit={submit}>
          <HovLogo />
          <h1>Create your account</h1>
          <p className="sub">Join a safe, supportive community. It’s free.</p>
          {error && <div className="auth-err">{error}</div>}
          {ok && <div className="auth-ok">Account created! Taking you in…</div>}
          <input className="auth-field" placeholder="Your name (or a nickname)" required minLength={2}
            value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
          <input className="auth-field" type="email" placeholder="Email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="auth-field" type="password" placeholder="Password (12+ characters)" required minLength={12}
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="hb hb-red hb-lg" type="submit" disabled={busy}>
            {busy ? 'Creating…' : 'Sign Up'}
          </button>
          <p className="auth-alt">Already have an account? <Link href="/login">Log in</Link></p>
        </form>
      </div>
    </HovShell>
  );
}
