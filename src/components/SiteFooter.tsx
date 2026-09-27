import Link from 'next/link';
import { LogoMark } from './Logo';

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <span style={{ color: 'var(--red)' }}><LogoMark size={30} /></span>
          <p className="site-footer-tag">
            Evidence-first civic accountability.<br />Facts, records, and clear next steps —
            for everyone.
          </p>
        </div>

        <nav className="site-footer-col" aria-label="Product">
          <h4>Explore</h4>
          <Link href="/elections">See who&apos;s running</Link>
          <Link href="/community">Community brief</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/methodology">How we check facts</Link>
        </nav>

        <nav className="site-footer-col" aria-label="Organization">
          <h4>Organization</h4>
          <Link href="/about">About</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href="mailto:hello@hearourvoices.org">Contact</a>
        </nav>

        <nav className="site-footer-col" aria-label="Trust">
          <h4>Trust &amp; safety</h4>
          <Link href="/methodology">Our methodology</Link>
          <a href="/security.txt">Report a vulnerability</a>
          <span className="site-footer-note">Nonpartisan · Evidence-based</span>
        </nav>
      </div>

      <div className="site-footer-bottom">
        <p>© {year} HearOURVOICES. Built for public transparency.</p>
        <p className="site-footer-legal">
          Not legal advice. Demonstration data is fictional and implies no real wrongdoing.
        </p>
      </div>
    </footer>
  );
}
