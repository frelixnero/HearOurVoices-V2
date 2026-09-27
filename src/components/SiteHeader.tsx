import Link from 'next/link';
import { Wordmark } from './Logo';

// Public site header (marketing + content pages). Sticky, in-flow, responsive.
// The mobile menu uses a native <details> element so it needs no JavaScript.
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand" aria-label="HearOURVOICES home">
          <Wordmark size={19} />
        </Link>

        <nav className="site-nav" aria-label="Primary">
          <Link href="/elections">See who&apos;s running</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/methodology">How we check facts</Link>
          <Link href="/about">About</Link>
        </nav>

        <div className="site-header-actions">
          <Link href="/community" className="btn btn-ghost">Sign in</Link>
          <Link href="/community" className="btn btn-primary">Open the app</Link>
        </div>

        <details className="site-menu">
          <summary aria-label="Open menu"><span /><span /><span /></summary>
          <div className="site-menu-panel">
            <Link href="/elections">See who&apos;s running</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/methodology">How we check facts</Link>
            <Link href="/about">About</Link>
            <Link href="/community" className="btn btn-primary">Open the app</Link>
          </div>
        </details>
      </div>
    </header>
  );
}
