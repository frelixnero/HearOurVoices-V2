// At-rest encryption for whistleblower tips. AES-256-GCM (authenticated) so a
// database leak alone can't read submissions — the key lives only in the
// WHISTLEBLOWER_KEY env var, never in the DB. This is honest at-rest encryption:
// the review team CAN decrypt to act on tips. It is NOT end-to-end, and we say so.
import crypto from 'crypto';

export const whistleblowerEnabled = (): boolean => !!process.env.WHISTLEBLOWER_KEY;

// Derive a stable 32-byte key from the env secret (any length/format accepted).
function key(): Buffer {
  const s = process.env.WHISTLEBLOWER_KEY;
  if (!s) throw new Error('WHISTLEBLOWER_KEY is not set.');
  return crypto.createHash('sha256').update(s, 'utf8').digest();
}

export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decrypt(payload: string): string {
  const buf = Buffer.from(payload, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}
