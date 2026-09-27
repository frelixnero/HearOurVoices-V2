// Slug <-> display-name helpers for the 50 states + D.C. state landing pages.
import { JURISDICTIONS } from './service';

export const slugifyState = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// slug -> display name (e.g. "new-york" -> "New York")
const BY_SLUG: Record<string, string> = Object.fromEntries(JURISDICTIONS.map((n) => [slugifyState(n), n]));

export const stateFromSlug = (slug: string): string | null => BY_SLUG[slug.toLowerCase()] ?? null;

export const STATE_LIST: { name: string; slug: string }[] = JURISDICTIONS.map((name) => ({ name, slug: slugifyState(name) }));
