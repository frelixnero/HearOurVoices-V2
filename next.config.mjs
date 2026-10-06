/** @type {import('next').NextConfig} */

// Content-Security-Policy (spec §32). 'unsafe-inline' for styles covers the inline
// style attributes used in a few pages + Google Fonts. Scripts are restricted;
// in dev, Next's HMR needs 'unsafe-eval'. Tighten with nonces before public launch.
const isDev = process.env.NODE_ENV !== 'production';
const csp = [
  "default-src 'self' https://hearourvoices.net https://hearourvoices.app",
  `script-src 'self' 'unsafe-inline' https://hearourvoices.net https://hearourvoices.app${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://hearourvoices.net https://hearourvoices.app",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://hearourvoices.net https://hearourvoices.app",
  "connect-src 'self' https://hearourvoices.net https://hearourvoices.app",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Self-contained server bundle for Docker/container deploys.
  output: 'standalone',
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
