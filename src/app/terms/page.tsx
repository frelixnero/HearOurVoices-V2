import type { Metadata } from 'next';
import '../dashboard.css';
import '../marketing.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = { title: 'Terms', description: 'The rules for using HearOURVOICES.' };

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="simple">
        <h1 className="big-title">Terms of use</h1>
        <p className="explain">
          Plain-language summary. A full terms of service is reviewed by counsel before public launch.
        </p>
        {[
          ['Be truthful', 'Share concerns honestly and add sources. Do not post things you know to be false as if they were proven.'],
          ['Be lawful and kind', 'No threats, harassment, doxxing, or calls for violence. Protect witnesses and private information.'],
          ['Evidence standards', 'Serious allegations go through human review before publication. You may be asked to add sources.'],
          ['Officials’ rights', 'Officials and affected people can respond, dispute, and request corrections.'],
          ['Moderation & appeals', 'If we act on your content, we tell you why and you can appeal to a different reviewer.'],
          ['No pay-to-rank', 'No one can pay to raise a score or hide evidence — ever.'],
        ].map(([h, b]) => (
          <div key={h} style={{ marginTop: 22 }}>
            <h2 style={{ font: "800 20px 'Libre Franklin'", color: 'var(--navy)', margin: '0 0 6px' }}>{h}</h2>
            <p style={{ fontSize: 16.5, lineHeight: 1.6, color: '#3e4c52', margin: 0 }}>{b}</p>
          </div>
        ))}
        <p style={{ marginTop: 26, fontSize: 15, color: '#7a878c' }}>This platform is information, not legal advice.</p>
      </main>
      <SiteFooter />
    </>
  );
}
