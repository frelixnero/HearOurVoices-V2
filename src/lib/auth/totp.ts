// TOTP (RFC 6238) for multi-factor authentication enrollment (spec §32). Pure
// Node crypto — no external dependency. Compatible with Google Authenticator,
// Authy, 1Password, etc. (SHA-1, 6 digits, 30s step).
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const DIGITS = 6;
const STEP_SECONDS = 30;
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/** Generate a new random base32 secret (default 20 bytes = 160 bits). */
export function generateSecret(bytes = 20): string {
  return base32Encode(randomBytes(bytes));
}

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

export function base32Decode(input: string): Buffer {
  const clean = input.replace(/=+$/, '').toUpperCase().replace(/\s/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = BASE32_ALPHABET.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

function hotp(secret: Buffer, counter: number): string {
  const buf = Buffer.alloc(8);
  // Write the 64-bit counter big-endian.
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const hmac = createHmac('sha1', secret).update(buf).digest();
  const offset = hmac[hmac.length - 1]! & 0xf;
  const bin =
    ((hmac[offset]! & 0x7f) << 24) |
    ((hmac[offset + 1]! & 0xff) << 16) |
    ((hmac[offset + 2]! & 0xff) << 8) |
    (hmac[offset + 3]! & 0xff);
  return (bin % 10 ** DIGITS).toString().padStart(DIGITS, '0');
}

/** Current TOTP code for a base32 secret (used in tests / dev display). */
export function generateToken(secretBase32: string, atMs = Date.now()): string {
  const counter = Math.floor(atMs / 1000 / STEP_SECONDS);
  return hotp(base32Decode(secretBase32), counter);
}

/**
 * Verify a user-supplied token, allowing ±1 time step for clock drift.
 * Constant-time comparison of the candidate codes.
 */
export function verifyToken(secretBase32: string, token: string, atMs = Date.now()): boolean {
  const clean = token.replace(/\s/g, '');
  if (!/^\d{6}$/.test(clean)) return false;
  const secret = base32Decode(secretBase32);
  const counter = Math.floor(atMs / 1000 / STEP_SECONDS);
  for (let w = -1; w <= 1; w++) {
    const candidate = hotp(secret, counter + w);
    const a = Buffer.from(candidate);
    const b = Buffer.from(clean);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}

/** otpauth:// URI for QR codes / authenticator apps. */
export function otpauthUri(secretBase32: string, account: string, issuer = 'HearOURVOICES'): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({
    secret: secretBase32,
    issuer,
    algorithm: 'SHA1',
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}
