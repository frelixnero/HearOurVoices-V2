'use client';

import { useEffect, useState } from 'react';

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type State = 'unknown' | 'unsupported' | 'off' | 'on' | 'blocked' | 'working';

// One-tap opt-in for red-flag / breaking-news push alerts. Requires the user to
// grant permission — browsers allow no other way (that's the point).
export function PushOptIn() {
  const [state, setState] = useState<State>('unknown');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window) || !VAPID) {
      setState('unsupported'); return;
    }
    if (Notification.permission === 'denied') { setState('blocked'); return; }
    navigator.serviceWorker.getRegistration().then(async (reg) => {
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      setState(sub ? 'on' : 'off');
    }).catch(() => setState('off'));
  }, []);

  async function enable() {
    setState('working'); setMsg(null);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { setState(perm === 'denied' ? 'blocked' : 'off'); return; }
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID) as BufferSource,
      });
      const r = await fetch('/api/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) });
      if (r.ok) { setState('on'); setMsg('You’ll get an alert when a red flag or big story breaks.'); }
      else { setState('off'); setMsg('Could not turn on alerts. Try again.'); }
    } catch { setState('off'); setMsg('Could not turn on alerts. Try again.'); }
  }

  async function disable() {
    setState('working');
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (sub) {
        await fetch('/api/push/subscribe', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) });
        await sub.unsubscribe();
      }
      setState('off'); setMsg(null);
    } catch { setState('on'); }
  }

  if (state === 'unsupported' || state === 'unknown') return null;

  return (
    <div className="hov-pushbar">
      {state === 'blocked' ? (
        <span className="pb-note">🔕 Alerts are blocked in your browser settings. Allow notifications for this site to turn them on.</span>
      ) : state === 'on' ? (
        <><span className="pb-on">🔔 Red-flag alerts are on</span><button className="pb-link" onClick={disable}>Turn off</button></>
      ) : (
        <>
          <button className="pb-btn" disabled={state === 'working'} onClick={enable}>{state === 'working' ? 'Turning on…' : '🔔 Get red-flag alerts'}</button>
          <span className="pb-note">Free. Get notified the moment a red flag or big story breaks.</span>
        </>
      )}
      {msg && <span className="pb-msg">{msg}</span>}
    </div>
  );
}
