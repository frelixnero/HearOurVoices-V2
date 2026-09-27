import type { Metadata } from 'next';
import { HovShell } from '@/components/HovShell';
import { WhistleblowerForm } from '@/components/WhistleblowerForm';
import { getSecureDropOrgs } from '@/lib/whistleblower/securedrop';

export const metadata: Metadata = {
  title: 'Secure Tip Line',
  description: 'A safe, anonymous channel to report wrongdoing. No account, no name, no IP stored — with honest guidance on staying protected.',
};

export default async function WhistleblowerPage() {
  const secureDrops = await getSecureDropOrgs(8);
  return (
    <HovShell active="tips">
      <div className="hov-page">
        <div className="hov-wrap" style={{ maxWidth: 760 }}>
          <div className="wb-hero">
            <p className="pg-eyebrow" style={{ color: '#5fd39a' }}>SECURE TIP LINE</p>
            <h1>See something wrong? Tell us safely.</h1>
            <p>
              A channel for people who need to report wrongdoing without exposing themselves. We ask for no name, no email,
              and no phone number, we don’t store your IP address, and your message is encrypted the moment it’s saved.
            </p>
          </div>

          <div className="wb-what">
            <div className="wb-col ok">
              <h3>✅ What we do</h3>
              <ul>
                <li>Ask for <b>nothing</b> about who you are</li>
                <li>Store <b>no IP address</b> and no device info in our records</li>
                <li>Encrypt your message at rest (a database leak can’t read it)</li>
                <li>Let only a small review team read tips, to act on them</li>
                <li>Point real evidence into Red Flags, Civic News, and reports</li>
              </ul>
            </div>
            <div className="wb-col warn">
              <h3>⚠️ Honest limits — please read</h3>
              <ul>
                <li>No website can <b>promise</b> perfect anonymity</li>
                <li>Your internet provider and our host can still see network traffic — we don’t control that</li>
                <li>Details only an insider would know can identify you — keep it general</li>
                <li>This is <b>not</b> end-to-end encryption; our review team can read tips</li>
                <li><b>Don’t upload files here</b> — photos/documents carry hidden data that can unmask you</li>
              </ul>
            </div>
          </div>

          <div className="wb-highrisk">
            <b>If your safety or freedom is truly at risk</b>, a civic website is not enough. Use the <b>Tor Browser</b> on a
            device that isn’t linked to you, and submit through <b>SecureDrop</b> — the audited system these newsrooms and
            legal groups run for sources. Open a link below <b>in the Tor Browser</b>, and consider talking to a whistleblower
            attorney first.
          </div>

          <div className="wb-sd">
            <h3>Newsrooms &amp; legal groups that take secure tips</h3>
            <div className="wb-sd-grid">
              {secureDrops.map((o) => (
                <a key={o.landingUrl} className="wb-sd-card" href={o.landingUrl} target="_blank" rel="noreferrer noopener">
                  <div className="wb-sd-name">{o.title}{o.us && <span className="wb-sd-us">US</span>}</div>
                  {o.description && <p>{o.description}</p>}
                  <span className="wb-sd-go">How to contact them securely →</span>
                </a>
              ))}
            </div>
            <p className="wb-sd-more">
              These are pulled from the public <a href="https://securedrop.org/directory/" target="_blank" rel="noreferrer noopener">SecureDrop directory</a>.
              Open the links in the Tor Browser for the strongest protection.
            </p>
          </div>

          <WhistleblowerForm />
        </div>
      </div>
    </HovShell>
  );
}
