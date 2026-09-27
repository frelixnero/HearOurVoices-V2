// Zod schemas — every API input is validated (spec §45 coding rule 3).
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(12).max(200),
  displayName: z.string().min(2).max(80),
  locale: z.string().max(20).optional(),
  timezone: z.string().max(64).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(200),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(12).max(200),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
