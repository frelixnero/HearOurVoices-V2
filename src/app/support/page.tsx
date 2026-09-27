import type { Metadata } from 'next';
import { HovShell } from '@/components/HovShell';
import { SupportActions } from '@/components/SupportActions';

export const metadata: Metadata = {
  title: 'Support HearOURvoices',
  description: 'Help keep government action visible, verified, and free for everyone. Donate or become a member.',
};

// Honest, live features only. No "coming soon" sold as included.
const TIERS = [
  {
    name: 'Citizen', price: '$5', cadence: '/mo', blurb: 'For everyday people who want clarity without digging through hundreds of pages.',
    features: ['Civic News with public voting', 'Red Flags on the documented record', 'Bills & your state page', 'The Justice Vault & Honor Vault', 'Helps keep the platform free for everyone'],
    plan: 'citizen',
  },
  {
    name: 'Supporter', price: '$15', cadence: '/mo', blurb: 'For organizers and community members who want to fund broader coverage.',
    features: ['Everything in Citizen', 'Directly funds adding more states & data', 'Priority on feature requests', 'Supporter badge (optional)'],
    plan: 'supporter', featured: true,
  },
  {
    name: 'Newsroom / Org', price: '$49', cadence: '/mo', blurb: 'For newsrooms, nonprofits, and coalitions that rely on the data.',
    features: ['Everything in Supporter', 'Early access to new tools as they ship', 'A say in the roadmap', 'Sustains the mission at scale'],
    plan: 'org',
  },
];

const DONATIONS = [
  { label: 'Give $10', amount: 10 }, { label: 'Give $25', amount: 25 },
  { label: 'Give $50', amount: 50 }, { label: 'Give $100', amount: 100 },
];

export default function SupportPage() {
  const subscriptionsOn = process.env.SUBSCRIPTIONS_ENABLED === 'true';
  return (
    <HovShell active="support">
      <div className="hov-page">
        <div className="hov-wrap">
          <div className="bl-hero">
            <p className="pg-eyebrow" style={{ color: '#7fb0e8' }}>SUPPORT THE MISSION</p>
            <h1>Keep government action visible — and free for everyone.</h1>
            <p>
              HearOURvoices is built to make public actions verified, clear, and hard to ignore. Your support funds more
              states, more data, and keeps the core platform free. Here’s exactly what it pays for — no fluff.
            </p>
          </div>

          <div className="sp-section">
            <h2>Give once</h2>
            <p className="sp-sub">A one-time gift toward coverage and server costs.</p>
            <SupportActions kind="donation" options={DONATIONS} />
          </div>

          <div className="sp-section">
            <h2>Become a member</h2>
            <p className="sp-sub">Monthly support that keeps the lights on. Cancel anytime.{!subscriptionsOn && ' Memberships open soon — for now, a one-time gift above goes just as far.'}</p>
            <div className="sp-tiers">
              {TIERS.map((t) => (
                <div key={t.plan} className={`sp-tier${t.featured ? ' featured' : ''}`}>
                  {t.featured && <span className="sp-badge">Most support</span>}
                  <h3>{t.name}</h3>
                  <div className="sp-price">{t.price}<span>{t.cadence}</span></div>
                  <p className="sp-blurb">{t.blurb}</p>
                  <ul className="sp-feat">{t.features.map((f, i) => <li key={i}>✓ {f}</li>)}</ul>
                  <SupportActions kind="membership" plan={t.plan} planName={t.name} enabled={subscriptionsOn} />
                </div>
              ))}
            </div>
          </div>

          <div className="rf-note">
            <p style={{ margin: '0 0 8px' }}><b>Where your money goes:</b> adding states and legislative data, hosting and servers,
              and keeping the Justice Vault, Honor Vault, Red Flags, and Civic News free to read for everyone.</p>
            <p style={{ margin: 0 }}><b>What we don’t do:</b> we never charge to keep a case or a hero visible, and sponsors never
              influence what the data says. Grants and larger partnerships? <a href="mailto:hello@hearourvoices.app" style={{ color: '#7fb0e8' }}>Get in touch</a>.</p>
          </div>
        </div>
      </div>
    </HovShell>
  );
}
