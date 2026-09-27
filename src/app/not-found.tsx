import Link from 'next/link';
import './dashboard.css';
import './marketing.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="simple" style={{ textAlign: 'center', paddingTop: 70 }}>
        <p className="section-eyebrow">PAGE NOT FOUND</p>
        <h1 className="big-title">We couldn’t find that page</h1>
        <p className="explain" style={{ maxWidth: 560, margin: '0 auto 24px' }}>
          The link may be old or mistyped. Let’s get you back to something useful.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary btn-lg">Go home</Link>
          <Link href="/elections" className="btn btn-outline btn-lg">See who’s running</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
