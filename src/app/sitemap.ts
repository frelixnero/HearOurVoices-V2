import type { MetadataRoute } from 'next';

const base = process.env.APP_BASE_URL ?? 'https://www.hearourvoices.org';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ['', '/elections', '/how-it-works', '/methodology', '/about', '/privacy', '/terms'];
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/elections' ? 'daily' : 'monthly',
    priority: path === '' ? 1 : path === '/elections' ? 0.9 : 0.6,
  }));
}
