// Honor Vault display metadata + resurfacing ("Never Forget") logic.

export const HONOR_CATEGORIES = ['FALLEN', 'COMBAT', 'LIFESAVING', 'COMMUNITY', 'LEGACY'] as const;
export type HonorCategory = (typeof HONOR_CATEGORIES)[number];

export const CATEGORY_META: Record<HonorCategory, { text: string; color: string; blurb: string }> = {
  FALLEN: { text: 'Fallen', color: '#c9a227', blurb: 'Gave their lives in service.' },
  COMBAT: { text: 'Combat Valor', color: '#c0392b', blurb: 'Honored for courage under fire.' },
  LIFESAVING: { text: 'Life-Saving', color: '#2e86c1', blurb: 'Saved lives, in uniform or after.' },
  COMMUNITY: { text: 'Community', color: '#1c9d5b', blurb: 'Served their community after service.' },
  LEGACY: { text: 'Legacy', color: '#8e6bd0', blurb: 'A long life of lasting impact.' },
};

// Common U.S. military decorations (for the admin form and display).
export const MEDALS = [
  'Medal of Honor', 'Distinguished Service Cross', 'Navy Cross', 'Air Force Cross', 'Coast Guard Cross',
  'Silver Star', 'Bronze Star', 'Purple Heart', 'Distinguished Flying Cross', 'Soldier’s Medal',
  'Combat Action Badge', 'Combat Infantryman Badge', 'Distinguished Service Medal', 'Legion of Merit',
] as const;

export const BRANCHES = ['Army', 'Navy', 'Marine Corps', 'Air Force', 'Coast Guard', 'Space Force'] as const;

export interface HonorQuote { quote: string; attribution?: string }
export interface KeyDate { label: string; date: string } // date free-form or "MM-DD" / ISO

// Remembrance tokens visitors can leave at a hero's resting place. They accumulate
// and never reset — the memorial grows with every visit. Each carries real meaning.
export const REMEMBRANCE_TOKENS = [
  { key: 'candle', field: 'candles', icon: '🕯️', label: 'Light a candle', short: 'a light left in their memory',
    meaning: 'A candle lit so their memory keeps burning.' },
  { key: 'coin', field: 'coins', icon: '🪙', label: 'Leave a coin', short: 'the tradition of the coin',
    meaning: 'A military tradition: a coin left on a headstone tells the family someone came. A penny means you visited. A nickel means you trained together. A dime means you served together. A quarter means you were there when they fell.' },
  { key: 'flag', field: 'flags', icon: '🇺🇸', label: 'Plant a flag', short: 'planted in honor of their service',
    meaning: 'A flag planted to honor their service and sacrifice.' },
  { key: 'stone', field: 'stones', icon: '🪨', label: 'Place a stone', short: 'I was here, and I remember',
    meaning: 'A stone placed to say, simply: I was here, and I remember.' },
  { key: 'flower', field: 'flowers', icon: '🌹', label: 'Lay flowers', short: 'laid in remembrance',
    meaning: 'Flowers laid at their resting place in remembrance.' },
] as const;

export type TokenKey = (typeof REMEMBRANCE_TOKENS)[number]['key'];
export const TOKEN_KEYS = REMEMBRANCE_TOKENS.map((t) => t.key) as TokenKey[];
export const TOKEN_FIELD: Record<TokenKey, string> = Object.fromEntries(REMEMBRANCE_TOKENS.map((t) => [t.key, t.field])) as Record<TokenKey, string>;

export const HONOR_META = (score: number) =>
  score >= 90 ? { text: 'Extraordinary honor', color: '#c9a227' }
  : score >= 70 ? { text: 'Exceptional honor', color: '#d9a334' }
  : score >= 50 ? { text: 'Distinguished honor', color: '#2e86c1' }
  : { text: 'Honored service', color: '#1c9d5b' };

// National days when every hero is resurfaced.
const NATIONAL_DAYS: { label: string; test: (d: Date) => boolean }[] = [
  { label: 'Independence Day', test: (d) => d.getMonth() === 6 && d.getDate() === 4 },
  { label: 'Veterans Day', test: (d) => d.getMonth() === 10 && d.getDate() === 11 },
  // Memorial Day = last Monday of May.
  { label: 'Memorial Day', test: (d) => d.getMonth() === 4 && d.getDay() === 1 && d.getDate() > 24 },
];

/** National-remembrance day today, if any. */
export function nationalDayToday(today = new Date()): string | null {
  return NATIONAL_DAYS.find((n) => n.test(today))?.label ?? null;
}

const mmdd = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** True if one of the hero's key dates falls on today's month/day. */
export function rememberedToday(keyDates: KeyDate[], today = new Date()): KeyDate | null {
  const key = mmdd(today);
  for (const kd of keyDates ?? []) {
    const m = kd.date?.match(/(\d{1,2})[-/](\d{1,2})/); // matches MM-DD or YYYY-MM-DD tail loosely
    if (!m) continue;
    // Normalize to MM-DD; if the string looks like YYYY-MM-DD take the last two groups.
    const parts = kd.date.split(/[-/]/).map((x) => x.trim());
    const [mo, da] = parts.length >= 3 ? [parts[1], parts[2]] : [parts[0], parts[1]];
    if (!mo || !da) continue;
    if (`${mo.padStart(2, '0')}-${da.padStart(2, '0')}` === key) return kd;
  }
  return null;
}
