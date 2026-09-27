'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HovShell } from '@/components/HovShell';
import { HovLogo } from '@/components/HovLogo';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error?.message ?? 'Invalid email or password.');
      } else {
        window.location.href = '/stories';
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <HovShell active="login">
      <div className="auth-wrap">
        <form className="auth-card" onSubmit={submit}>
          <HovLogo />
          <h1>Welcome back</h1>
          <p className="sub">Log in to share and support.</p>
          {error && <div className="auth-err">{error}</div>}
          <input className="auth-field" type="email" placeholder="Email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="auth-field" type="password" placeholder="Password" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="hb hb-red hb-lg" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Log In'}
          </button>
          <p className="auth-alt">New here? <Link href="/signup">Create an account</Link></p>
        </form>
      </div>
    </HovShell>
  );
}
