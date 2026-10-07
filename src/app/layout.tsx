import type { Metadata, Viewport } from 'next';
// New product theme (story-sharing platform). Legacy civic CSS is imported only by
// the specific legacy pages that still use it, so it can't leak into the new design.
import './theme.css';
import './globals.css';

const siteUrl = process.env.APP_BASE_URL ?? 'https://www.hearourvoices.org';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'hearOURvoices — Your Voice Matters. Your Story Has Power.',
    template: '%s · hearOURvoices',
  },
  description:
    'Share your experience anonymously or publicly, build awareness, and change the narrative. A safe, supportive, moderated community for real stories.',
  applicationName: 'hearOURvoices',
  keywords: [
    'share your story', 'anonymous stories', 'community support', 'awareness',
    'mental health', 'workplace', 'safe space', 'survivor stories',
  ],
  authors: [{ name: 'hearOURvoices' }],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg' }],
  },
  openGraph: {
    type: 'website',
    siteName: 'hearOURvoices',
    title: 'Your Voice Matters. Your Story Has Power.',
    description: 'Share experiences. Build awareness. Change the narrative.',
    url: siteUrl,
    images: [{ url: '/og.svg', width: 1200, height: 630, alt: 'hearOURvoices' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'hearOURvoices — Your Voice Matters. Your Story Has Power.',
    description: 'A safe, supportive community for real stories.',
    images: ['/og.svg'],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#f5f4ef',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">Skip to main content</a>
        <div id="main">{children}</div>
      </body>
    </html>
  );
}
