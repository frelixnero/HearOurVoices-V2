// Password + token cryptography (spec §32 — strong password policy, secure
// secrets, peppered IP hashing).
//
// Password hashing uses Node's built-in scrypt (memory-hard, no native build
// deps — portable across Windows/macOS/Linux). Session tokens are random; only
// their SHA-256 hash is stored (§28.1 tokenHash, ipHash).
import {
  createHash,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
  type ScryptOptions,
} from 'node:crypto';

// Typed promise wrapper — Node's promisify types don't cover the options overload.
function scrypt(
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password, salt, keylen, options, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

// scrypt parameters. N=2^15 is a reasonable interactive cost.
const SCRYPT_N = 32768;
const SCRYPT_r = 8;
const SCRYPT_p = 1;
const KEYLEN = 32;
// scrypt needs ~128*N*r bytes (~34MB here), above OpenSSL's 32MB default maxmem —
// raise it explicitly or Node throws ERR_CRYPTO_INVALID_SCRYPT_PARAMS.
const SCRYPT_MAXMEM = 128 * SCRYPT_N * SCRYPT_r * 2;

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(plain, salt, KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_r,
    p: SCRYPT_p,
    maxmem: SCRYPT_MAXMEM,
  });
  return `scrypt$${SCRYPT_N}$${SCRYPT_r}$${SCRYPT_p}$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export async function verifyPassword(stored: string, plain: string): Promise<boolean> {
  try {
    const parts = stored.split('$');
    if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
    const N = Number(parts[1]);
    const r = Number(parts[2]);
    const p = Number(parts[3]);
    const salt = Buffer.from(parts[4] ?? '', 'hex');
    const expected = Buffer.from(parts[5] ?? '', 'hex');
    const derived = await scrypt(plain, salt, expected.length, { N, r, p, maxmem: SCRYPT_MAXMEM });
    return expected.length === derived.length && timingSafeEqual(expected, derived);
  } catch {
    return false;
  }
}

/** Returns { token, tokenHash }. Give the raw token to the client cookie; store the hash. */
export function createSessionToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, tokenHash: sha256(token) };
}

export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/** Peppered IP hash — we never store raw IPs (§33). */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const pepper = process.env.IP_HASH_PEPPER ?? '';
  return sha256(`${pepper}:${ip}`);
}
