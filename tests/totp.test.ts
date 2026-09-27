import { describe, it, expect } from 'vitest';
import { generateSecret, generateToken, verifyToken, otpauthUri, base32Decode, base32Encode } from '@/lib/auth/totp';

describe('TOTP MFA (spec §32)', () => {
  it('base32 round-trips', () => {
    const buf = Buffer.from('hello world');
    expect(base32Decode(base32Encode(buf)).equals(buf)).toBe(true);
  });

  it('a freshly generated token verifies', () => {
    const secret = generateSecret();
    const token = generateToken(secret);
    expect(verifyToken(secret, token)).toBe(true);
  });

  it('a wrong token is rejected', () => {
    const secret = generateSecret();
    const token = generateToken(secret);
    const wrong = token === '000000' ? '111111' : '000000';
    expect(verifyToken(secret, wrong)).toBe(false);
  });

  it('accepts a token from the previous 30s step (clock drift)', () => {
    const secret = generateSecret();
    const now = Date.now();
    const prev = generateToken(secret, now - 30_000);
    expect(verifyToken(secret, prev, now)).toBe(true);
  });

  it('rejects a token from 5 steps ago', () => {
    const secret = generateSecret();
    const now = Date.now();
    const old = generateToken(secret, now - 150_000);
    // Only accept if it happens to collide; overwhelmingly should be false.
    expect(verifyToken(secret, old, now)).toBe(false);
  });

  it('produces a scannable otpauth URI', () => {
    const uri = otpauthUri('JBSWY3DPEHPK3PXP', 'user@example.com');
    expect(uri).toContain('otpauth://totp/');
    expect(uri).toContain('secret=JBSWY3DPEHPK3PXP');
    expect(uri).toContain('issuer=HearOURVOICES');
  });
});
