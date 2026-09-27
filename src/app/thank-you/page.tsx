import type { Metadata } from 'next';
import Link from 'next/link';
import { HovShell } from '@/components/HovShell';

export const metadata: Metadata = {
  title: 'Thank you',
  description: 'Thank you for supporting HearOURvoices.',
};

export default function ThankYouPage() {
  return (
    <HovShell active="support">
      <div className="hov-page">
        <div className="hov-wrap" style={{ maxWidth: 620, textAlign: 'center' }}>
          <div className="bl-hero" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 8 }}>🙏</div>
            <h1>Thank you.</h1>
            <p style={{ maxWidth: 480, margin: '0 auto' }}>
              Your support keeps government action visible, verified, and free for everyone. It directly funds more
              states, more data, and the servers that keep the Justice Vault, Honor Vault, and Civic News online.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="hb hb-red">Back to the site</Link>
            <Link href="/states" className="hb hb-ghost">What’s happening in your state</Link>
          </div>
          <p style={{ color: '#8b96ab', fontSize: 13, marginTop: 18 }}>A receipt was sent to the email you entered at checkout.</p>
        </div>
      </div>
    </HovShell>
  );
}
