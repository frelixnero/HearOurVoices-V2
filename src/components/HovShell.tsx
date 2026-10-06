import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { HovLogo } from './HovLogo';
import { rumorsEnabled } from '@/lib/flags';

// Shared nav + footer for the story-sharing site so every page is consistent.
export function HovShell({ active, children }: { active?: string; children: React.ReactNode }) {
  const on = (k: string) => (active === k ? 'on' : undefined);
  const rumors = rumorsEnabled();
  return (
    <div className="hov-root">
      <div className="hov-nav">
        <div className="hov-nav-in">
          <Link href="/" aria-label="hearOURvoices home"><HovLogo /></Link>
          <div className="hov-links" role="navigation" aria-label="Primary">
            <Link href="/" className={on('home')}>Home</Link>
            <Link href="/elections" className={on('elections')}>Elections</Link>
            <Link href="/news" className={on('news')}>Civic News</Link>
            <Link href="/states" className={on('states')}>My State</Link>
            <Link href="/bills" className={on('bills')}>Bills</Link>
            <Link href="/officials" className={on('officials')}>Officials</Link>
            <Link href="/red-flags" className={on('redflags')}>Red Flags</Link>
            <Link href="/vault" className={on('vault')}>Justice Vault</Link>
            <Link href="/honor" className={on('honor')}>Honor Vault</Link>
            <Link href="/whistleblower" className={on('tips')}>Tip Line</Link>
            <Link href="/stories" className={on('stories')}>Stories</Link>
            <Link href="/reports" className={on('reports')}>Reports</Link>
            {rumors && <Link href="/rumors" className={on('rumors')}>Rumors</Link>}
            <Link href="/resources" className={on('resources')}>Resources</Link>
            <Link href="/community" className={on('community')}>Community</Link>
          </div>
          <div className="hov-nav-cta">
            <Link href="/login" className="hb hb-ghost">Log In</Link>
            <Link href="/signup" className="hb hb-red">Sign Up</Link>
          </div>
          <details className="hov-mobile">
            <summary className="hov-burger" aria-label="Menu"><span /><span /><span /></summary>
            <div className="hov-mobile-panel">
              <Link href="/elections">Elections &amp; Voting Guide</Link>
              <Link href="/news">Civic News</Link>
              <Link href="/states">My State</Link>
              <Link href="/bills">Bills</Link>
              <Link href="/officials">Officials</Link>
              <Link href="/red-flags">Red Flags</Link>
              <Link href="/vault">Justice Vault</Link>
              <Link href="/honor">Honor Vault</Link>
              <Link href="/stories">Stories</Link>
              <Link href="/reports">Reports</Link>
              {rumors && <Link href="/rumors">Rumors</Link>}
              <Link href="/resources">Resources</Link>
              <Link href="/community">Community</Link>
              <Link href="/signup" className="hb hb-red">Sign Up</Link>
            </div>
          </details>
        </div>
      </div>

      {children}

      <div className="hov-foot">
        <div className="hov-wrap hov-foot-in">
          <div>
            <HovLogo />
            <p className="tag">Real stories. Real people.<br />Real change.</p>
            <div className="socials">
              <a href="#" aria-label="Facebook"><Facebook size={16} /></a>
              <a href="#" aria-label="Twitter"><Twitter size={16} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={16} /></a>
              <a href="#" aria-label="LinkedIn"><Linkedin size={16} /></a>
              <a href="#" aria-label="YouTube"><Youtube size={16} /></a>
            </div>
          </div>
          <div className="hov-fcol"><h4>Platform</h4>
            <Link href="/elections">Elections &amp; Voting</Link><Link href="/news">Civic News</Link><Link href="/states">My State</Link><Link href="/bills">Bills</Link><Link href="/officials">Officials</Link><Link href="/red-flags">Red Flags</Link><Link href="/vault">Justice Vault</Link><Link href="/honor">Honor Vault</Link>
            <Link href="/stories">Stories</Link><Link href="/reports">Reports</Link>
            {rumors && <Link href="/rumors">Rumors</Link>}
            <Link href="/topics">Topics</Link><Link href="/community">Community</Link>
          </div>
          <div className="hov-fcol"><h4>Support</h4>
            <Link href="/whistleblower">Secure Tip Line</Link>
            <Link href="/resources">Help Center</Link><Link href="/resources">Safety</Link>
            <Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link>
            <Link href="/admin">Staff sign-in</Link>
          </div>
          <div className="hov-fcol"><h4>Get Involved</h4>
            <Link href="/signup">Volunteer</Link><Link href="/signup">Partner With Us</Link>
            <Link href="/share">Share Our Mission</Link><Link href="/support">Donate</Link>
            <Link href="/support">Support Us</Link>
          </div>
          <div className="hov-fcol"><h4>Stay Connected</h4>
            <span style={{ fontSize: 14, color: '#9aa6bd' }}>Join our newsletter for updates</span>
            <form className="hov-news" action="/api/newsletter" method="post">
              <input type="email" name="email" placeholder="Enter your email" aria-label="Email" required />
              <button className="hb hb-red" type="submit">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="hov-foot-bot">© {new Date().getFullYear()} hearOURvoices. All rights reserved.</div>
      </div>
    </div>
  );
}
