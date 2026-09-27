// Strong password policy (spec §32). Kept as a pure function so it is unit-testable
// and reusable on both register and password-change flows.
export interface PasswordCheck {
  ok: boolean;
  errors: string[];
}

const COMMON = new Set([
  'password', 'password1', '12345678', 'qwertyui', 'letmein1', 'iloveyou',
]);

export function checkPasswordStrength(pw: string): PasswordCheck {
  const errors: string[] = [];
  if (pw.length < 12) errors.push('Password must be at least 12 characters.');
  if (!/[a-z]/.test(pw)) errors.push('Add a lowercase letter.');
  if (!/[A-Z]/.test(pw)) errors.push('Add an uppercase letter.');
  if (!/[0-9]/.test(pw)) errors.push('Add a number.');
  if (!/[^A-Za-z0-9]/.test(pw)) errors.push('Add a symbol.');
  if (COMMON.has(pw.toLowerCase())) errors.push('This password is too common.');
  return { ok: errors.length === 0, errors };
}
