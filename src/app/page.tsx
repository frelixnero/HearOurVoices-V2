import type { Metadata } from 'next';
import Link from 'next/link';
import {
  SquarePen, Tag, Users, Megaphone, Eye, Globe, ShieldCheck, User, Lock,
  HeartHandshake, Phone, HeartPulse, Scale, Quote, Facebook, Twitter,
  Instagram, Linkedin, Youtube, Apple, Play,
} from 'lucide-react';
import { HovLogo } from '@/components/HovLogo';
import { NewsJudgment } from '@/components/NewsJudgment';
import { PushOptIn } from '@/components/PushOptIn';
import { rumorsEnabled } from '@/lib/flags';
import { listNews } from '@/lib/civic/service';
import { SCOPE_META, detectRedFlags, type CivicScope } from '@/lib/civic/labels';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'hearOURvoices — Your Voice Matters. Your Story Has Power.',
  description:
    'Share your experience anonymously or publicly, build awareness, and change the narrative. A safe, supportive, moderated community for real stories.',
};

const STEPS = [
  { icon: <SquarePen size={24} />, t: 'Share Your Story', d: 'Write anonymously or publicly. You choose your comfort.' },
  { icon: <Tag size={24} />, t: 'Add Tags & Details', d: 'Help others find and relate to your experience.' },
  { icon: <Users size={24} />, t: 'Connect & Support', d: 'Engage with others, leave supportive comments.' },
  { icon: <Megaphone size={24} />, t: 'Create Change', d: 'Your voice helps raise awareness and drives real change.' },
];

export default async function Landing() {
  let items: Awaited<ReturnType<typeof listNews>>['items'] = [];
  try { ({ items } = await listNews({ take: 15 })); } catch { items = []; }
  const news = items.slice(0, 3);

  // Breaking alert: the highest-impact recent civic action — politics/money is
  // inherent to civic news — shown as the first thing on the page.
  const alert = [...items].sort((a, b) =>
    b.impactLevel - a.impactLevel ||
    ((b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0)),
  )[0] ?? null;

  // Red-flag alerts pulled straight from the documented process record.
  const flagged = items
    .map((n) => ({ n, flags: detectRedFlags(n as unknown as Record<string, boolean | null>) }))
    .filter((x) => x.flags.length > 0);
  const redFlagCount = flagged.reduce((s, x) => s + x.flags.length, 0);
  const topFlag = flagged[0] ?? null;
  return (
    <div className="hov-root">
      {/* NAV */}
      <div className="hov-nav">
        <div className="hov-nav-in">
          <Link href="/" aria-label="hearOURvoices home"><HovLogo /></Link>
          <div className="hov-links" role="navigation" aria-label="Primary">
            <Link href="/" className="on">Home</Link>
            <Link href="/news">Civic News</Link>
            <Link href="/states">My State</Link>
            <Link href="/bills">Bills</Link>
            <Link href="/red-flags">Red Flags</Link>
            <Link href="/vault">Justice Vault</Link>
            <Link href="/honor">Honor Vault</Link>
            <Link href="/stories">Stories</Link>
            <Link href="/reports">Reports</Link>
            {rumorsEnabled() && <Link href="/rumors">Rumors</Link>}
            <Link href="/community">Community</Link>
          </div>
          <div className="hov-nav-cta">
            <Link href="/login" className="hb hb-ghost">Log In</Link>
            <Link href="/signup" className="hb hb-red">Sign Up</Link>
          </div>
          <details className="hov-mobile">
            <summary className="hov-burger" aria-label="Menu"><span /><span /><span /></summary>
            <div className="hov-mobile-panel">
              <Link href="/stories">Stories</Link>
              <Link href="/topics">Topics</Link>
              <Link href="/resources">Resources</Link>
              <Link href="/about">About</Link>
              <Link href="/community">Community</Link>
              <Link href="/signup" className="hb hb-red">Sign Up</Link>
            </div>
          </details>
        </div>
      </div>

      {/* BREAKING / RED-FLAG ALERTS — first thing visitors see */}
      {alert && (
        <Link href={`/news/${alert.id}`} className="hov-alertbar" aria-label="Breaking civic news">
          <span className="hov-alert-live"><span className="dot" aria-hidden="true" />LIVE</span>
          <span className="hov-alert-scope" style={{ background: SCOPE_META[alert.scope as CivicScope].color }}>{SCOPE_META[alert.scope as CivicScope].text}</span>
          <span className="hov-alert-title">{alert.title}</span>
          <span className="hov-alert-go">Read →</span>
        </Link>
      )}
      {redFlagCount > 0 && (
        <Link href={topFlag ? `/news/${topFlag.n.id}` : '/red-flags'} className="hov-flagbar" aria-label="Red flag alerts">
          <span className="flag-badge">🚩 {redFlagCount} red flag{redFlagCount === 1 ? '' : 's'}</span>
          <span className="flag-text">{topFlag ? `in the record: ${topFlag.n.title}` : 'in the public record right now'}</span>
          <span className="flag-go">See who could have stopped it →</span>
        </Link>
      )}
      <PushOptIn />

      {/* HERO */}
      <section className="hov-hero">
        <div className="hov-hero-in">
          <div>
            <h1>Your Voice Matters.<br />Your Story Has <span className="red">Power.</span></h1>
            <p className="hov-hero-sub">Share experiences. Build awareness. Change the narrative.</p>
            <div className="hov-hero-cta">
              <Link href="/share" className="hb hb-red hb-lg">Share My Story</Link>
              <Link href="/stories" className="hb hb-dark hb-lg">Browse Stories</Link>
            </div>
            <div className="hov-badges">
              <div className="hov-badge"><User size={22} /><div><b>Anonymous</b><span>Share safely</span></div></div>
              <div className="hov-badge"><Lock size={22} /><div><b>Secure</b><span>Your privacy matters</span></div></div>
              <div className="hov-badge"><HeartHandshake size={22} /><div><b>Supportive</b><span>You are not alone</span></div></div>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div className="hov-portraits" aria-hidden="true">
              <i className="pf1"><User className="sil" /></i>
              <i className="pf2"><User className="sil" /></i>
              <i className="pf3"><User className="sil" /></i>
              <i className="pf4"><User className="sil" /></i>
              <i className="pf5"><User className="sil" /></i>
            </div>
            <div className="hov-quote">
              <div className="qm" aria-hidden="true">&ldquo;</div>
              <p>I shared my story because someone else&apos;s story once gave me strength.</p>
              <cite>— Community Member</cite>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="hov-stats-wrap">
        <div className="hov-stats">
          <div className="hov-stat"><span className="si"><Users size={22} /></span><div><b>250K+</b><span>Stories Shared</span></div></div>
          <div className="hov-stat"><span className="si"><Eye size={22} /></span><div><b>1.2M+</b><span>Voices Heard</span></div></div>
          <div className="hov-stat"><span className="si"><Globe size={22} /></span><div><b>150+</b><span>Countries</span></div></div>
          <div className="hov-stat"><span className="si"><ShieldCheck size={22} /></span><div><b>100%</b><span>Safe &amp; Moderated</span></div></div>
        </div>
      </div>

      {/* CIVIC NEWS (main-page feed) */}
      {news.length > 0 && (
        <section className="hov-wrap" style={{ padding: '54px 24px 10px' }}>
          <p className="section-eyebrow" style={{ textAlign: 'left' }}>CIVIC NEWS · PUBLIC JUDGMENT</p>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ textAlign: 'left', margin: '0 0 4px' }}>What people in power are doing</h2>
            <Link href="/news" style={{ color: 'var(--red)', fontWeight: 800 }}>See all — Local · State · Nation →</Link>
          </div>
          <p style={{ color: 'var(--muted)', margin: '0 0 22px' }}>Evidence, pros &amp; cons, and a neutral <b>public judgment</b> — you decide.</p>
          {news.map((n) => (
            <Link key={n.id} href={`/news/${n.id}`} className="nw-card">
              <div className="nw-top">
                <span className="nw-scope" style={{ background: SCOPE_META[n.scope as CivicScope].color }}>{SCOPE_META[n.scope as CivicScope].text}</span>
                <span className="nw-actor">{n.actorType}{n.jurisdiction ? ` · ${n.jurisdiction}` : ''}</span>
              </div>
              <h2 className="nw-title">{n.title}</h2>
              <p className="nw-why"><b>Why it matters:</b> {n.whyItMatters.slice(0, 160)}{n.whyItMatters.length > 160 ? '…' : ''}</p>
              <NewsJudgment judgment={n.judgment} />
            </Link>
          ))}
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="hov-how">
        <div className="hov-wrap">
          <h2>How hear<span className="our">OUR</span>voices Works</h2>
          <div className="hov-steps">
            {STEPS.map((s, i) => (
              <div key={s.t} className="hov-step">
                <div className="ci">{s.icon}</div>
                <div className="num">{i + 1}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
          <div className="hov-how-cta">
            <Link href="/share" className="hb hb-red hb-lg">Start Sharing Now</Link>
          </div>
        </div>
      </section>

      {/* APP SHOWCASE */}
      <section className="hov-app">
        <div className="hov-wrap hov-app-in">
          <div>
            <h2>Your Voice.<br />Anywhere.</h2>
            <p>The hearOURvoices app makes it easy to share, connect, and support—on the go.</p>
            <div className="hov-store">
              <a href="#" aria-label="Download on the App Store"><Apple size={22} /><span><span className="s-sm">Download on the</span><span className="s-lg">App Store</span></span></a>
              <a href="#" aria-label="Get it on Google Play"><Play size={20} /><span><span className="s-sm">GET IT ON</span><span className="s-lg">Google Play</span></span></a>
            </div>
          </div>
          <div className="hov-phones">
            {/* Phone 1 — Stories feed */}
            <div className="phone">
              <div className="phone-hd"><span>9:41</span><span>▮▮▮</span></div>
              <div className="phn-title">Stories</div>
              <div className="phn-tabs"><span className="on">Trending</span><span>Recent</span></div>
              <div className="scard"><div className="who"><span className="dot" />Anonymous · 2h ago</div><p>I was never listened to until I found this community.</p><span className="chip">Workplace</span><div className="rx"><span>♥ 128</span><span>💬 45</span><span>↗ 32</span></div></div>
              <div className="scard"><div className="who"><span className="dot" />Anonymous · 2h ago</div><p>It happened in school. I was afraid to speak up.</p><span className="chip">School</span><div className="rx"><span>♥ 96</span><span>💬 37</span><span>↗ 21</span></div></div>
            </div>
            {/* Phone 2 — Share */}
            <div className="phone mid">
              <div className="phone-hd"><span>9:41</span><span>▮▮▮</span></div>
              <div className="phn-title">‹ Share Your Story</div>
              <div className="phn-tabs"><span className="on">Write</span><span>Tag</span><span>Publish</span></div>
              <div className="phn-field">Tell your story…</div>
              <div style={{ fontSize: 9, color: '#8b96ab', margin: '0 4px 6px' }}>Add Tags</div>
              <div className="phn-chips">
                <span className="chip" style={{ background: '#1c3a2a', color: '#6ee7a8' }}>Workplace</span>
                <span className="chip">School</span><span className="chip">Healthcare</span>
                <span className="chip" style={{ background: '#3a3420', color: '#e8c86a' }}>Justice</span>
                <span className="chip">Military</span><span className="chip">Other</span>
              </div>
              <div className="phn-toggle"><span>Post anonymously</span><span className="tg on" /></div>
              <div className="phn-toggle"><span>Hide location</span><span className="tg" /></div>
              <div className="phn-btn">Next</div>
            </div>
            {/* Phone 3 — Community Support */}
            <div className="phone">
              <div className="phone-hd"><span>9:41</span><span>▮▮▮</span></div>
              <div className="phn-title">Community Support</div>
              <div style={{ fontSize: 9, color: '#8b96ab', margin: '0 4px 10px' }}>You are not alone. Help is always available.</div>
              <div className="support-row"><span className="ic"><Phone size={15} /></span><div><b>Crisis Hotlines</b><span>24/7 support</span></div></div>
              <div className="support-row"><span className="ic"><HeartPulse size={15} /></span><div><b>Mental Health Support</b><span>Find help near you</span></div></div>
              <div className="support-row"><span className="ic"><Scale size={15} /></span><div><b>Legal Help</b><span>Know your rights</span></div></div>
              <div className="support-row"><span className="ic"><Users size={15} /></span><div><b>Community Groups</b><span>Connect &amp; heal together</span></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERS (placeholders — real logos require signed partnerships) */}
      <div className="hov-partners">
        <div className="hov-wrap hov-partners-in">
          <span className="lbl">Trusted &amp; Supported By</span>
          <span className="hov-partner">PARTNER</span>
          <span className="hov-partner">ALLIANCE</span>
          <span className="hov-partner">NETWORK</span>
          <span className="hov-partner">COALITION</span>
          <span className="more">&amp; Many More</span>
        </div>
      </div>

      {/* FOOTER */}
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
          <div className="hov-fcol">
            <h4>Platform</h4>
            <Link href="/stories">Stories</Link><Link href="/topics">Topics</Link>
            <Link href="/community">Community</Link><Link href="/resources">Resources</Link>
          </div>
          <div className="hov-fcol">
            <h4>Support</h4>
            <Link href="/help">Help Center</Link><Link href="/safety">Safety</Link>
            <Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link>
          </div>
          <div className="hov-fcol">
            <h4>Get Involved</h4>
            <Link href="/volunteer">Volunteer</Link><Link href="/partner">Partner With Us</Link>
            <Link href="/share">Share Our Mission</Link><Link href="/donate">Donate</Link>
          </div>
          <div className="hov-fcol">
            <h4>Stay Connected</h4>
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
