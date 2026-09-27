import { describe, it, expect } from 'vitest';
import { checkPasswordStrength } from '@/lib/auth/password-policy';

describe('Password policy (spec §32)', () => {
  it('rejects short passwords', () => {
    expect(checkPasswordStrength('Ab1!xyz').ok).toBe(false);
  });
  it('rejects common passwords', () => {
    expect(checkPasswordStrength('password1').ok).toBe(false);
  });
  it('requires mixed character classes', () => {
    expect(checkPasswordStrength('alllowercaseletters').ok).toBe(false);
  });
  it('accepts a strong passphrase', () => {
    expect(checkPasswordStrength('Riverbend-Transparency-2024!').ok).toBe(true);
  });
});
