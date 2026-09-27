import type { Metadata } from 'next';
import '../dashboard.css';
import '../marketing.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = { title: 'Privacy', description: 'How HearOURVOICES collects and protects your data.' };

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="simple">
        <h1 className="big-title">Privacy</h1>
        <p className="explain">
          A short, plain-language summary. A full policy is reviewed by counsel before public launch.
        </p>
        {[
          ['What we collect', 'An email to sign in, and only the location detail you choose to share (like your city). We do not require your exact home address.'],
          ['Why we collect it', 'To show you the right local information and to keep the platform safe from bots and abuse.'],
          ['What we never do', 'We do not sell your personal data. We do not build or sell political profiles of you.'],
          ['Sensitive data', 'Identity documents and unredacted evidence are kept in restricted storage with signed, time-limited access. We store only an encrypted reference to identity checks — never the raw documents.'],
          ['Your rights', 'You can ask us to correct your information, and to delete it where the law allows (some records are kept for audit, fraud-prevention, or legal reasons).'],
        ].map(([h, b]) => (
          <div key={h} style={{ marginTop: 22 }}>
            <h2 style={{ font: "800 20px 'Libre Franklin'", color: 'var(--navy)', margin: '0 0 6px' }}>{h}</h2>
            <p style={{ fontSize: 16.5, lineHeight: 1.6, color: '#3e4c52', margin: 0 }}>{b}</p>
          </div>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
