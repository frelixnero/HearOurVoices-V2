// Live SecureDrop directory (https://securedrop.org). For genuinely high-risk
// sources, we point to established newsrooms/orgs that run audited SecureDrop
// instances over Tor — the right tool when a civic web form isn't enough.
// Fetched server-side and cached; falls back to a small vetted list if the
// directory is unreachable.

export interface SecureDropOrg {
  title: string;
  description: string;
  landingUrl: string;   // clearnet page with instructions (safe to open)
  onionAddress: string; // Tor-only address
  us: boolean;          // explicitly serves the USA (badge)
}

const DIRECTORY_URL = 'https://securedrop.org/api/v1/directory/?format=json';

interface RawOrg {
  title: string;
  organization_description?: string;
  landing_page_url?: string;
  onion_address?: string;
  countries?: string[];
  latest_scan?: { live?: boolean } | null;
}

// A small vetted fallback (US-relevant) if the live directory can't be reached.
const FALLBACK: SecureDropOrg[] = [
  { title: 'Whistleblower Aid', description: 'Nonprofit law firm representing whistleblowers from government and private companies.', landingUrl: 'https://whistlebloweraid.org/become-a-whistleblower/securedrop/', onionAddress: 'kogbxf4ysay2qzozmg7ar45ijqmj2vxrwqa4upzqq2i7sqj7wv7wcdqd.onion', us: true },
  { title: 'ProPublica', description: 'Independent, nonprofit investigative newsroom in the U.S.', landingUrl: 'https://propublica.org/tips', onionAddress: '33xu4yhum2eiisxm6fntaslayop76fvaqgt3ak5dakdm3t7cub25cead.onion', us: true },
  { title: 'The New York Times', description: 'American newspaper based in New York City.', landingUrl: 'https://www.nytimes.com/tips', onionAddress: 'ej3kv4ebuugcmuwxctx5ic7zxh73rnxt42soi3tdneu2c2em55thufqd.onion', us: true },
  { title: 'The Washington Post', description: 'American daily newspaper published in Washington, D.C.', landingUrl: 'https://www.washingtonpost.com/securedrop', onionAddress: 'vfnmxpa6fo4jdpyq3yneqhglluweax2uclvxkytfpmpkp5rsl75ir5qd.onion', us: true },
];

/** Fetch live SecureDrop orgs, US-relevant first. Cached 24h; never throws. */
export async function getSecureDropOrgs(limit = 8): Promise<SecureDropOrg[]> {
  try {
    const res = await fetch(DIRECTORY_URL, { next: { revalidate: 86400 } });
    if (!res.ok) return FALLBACK.slice(0, limit);
    const raw = (await res.json()) as RawOrg[];
    // Rank: explicit USA first, then "All countries" (accepts US sources), then rest.
    const rank = (c: string[]) => (c.includes('USA') ? 2 : c.includes('All countries') ? 1 : 0);
    const orgs = raw
      .filter((o) => o.latest_scan?.live && o.landing_page_url && o.title)
      .map((o) => {
        const countries = o.countries ?? [];
        return {
          _rank: rank(countries),
          title: o.title,
          description: (o.organization_description ?? '').trim(),
          landingUrl: o.landing_page_url!,
          onionAddress: o.onion_address ?? '',
          us: countries.includes('USA'),
        };
      })
      .sort((a, b) => b._rank - a._rank)
      .map(({ _rank, ...o }) => { void _rank; return o; });
    return orgs.length ? orgs.slice(0, limit) : FALLBACK.slice(0, limit);
  } catch {
    return FALLBACK.slice(0, limit);
  }
}
