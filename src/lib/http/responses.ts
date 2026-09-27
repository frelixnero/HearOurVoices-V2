// Standard API response shapes so every route returns predictable JSON and the
// client can render loading / error / empty / permission-denied states (spec
// §45 coding rule 16).
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export type ApiErrorCode =
  | 'unauthenticated'
  | 'permission_denied'
  | 'mfa_required'
  | 'validation_error'
  | 'not_found'
  | 'conflict'
  | 'rate_limited'
  | 'server_error';

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ ok: true, data }, init);
}

export function paginated<T>(
  items: T[],
  page: { cursor?: string | null; nextCursor?: string | null; total?: number },
): NextResponse {
  return NextResponse.json({ ok: true, data: items, page });
}

export function fail(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: unknown,
): NextResponse {
  return NextResponse.json({ ok: false, error: { code, message, details } }, { status });
}

export function fromZodError(err: ZodError): NextResponse {
  return fail('validation_error', 'Invalid input.', 422, err.flatten());
}

const STATUS: Record<ApiErrorCode, number> = {
  unauthenticated: 401,
  permission_denied: 403,
  mfa_required: 403,
  validation_error: 422,
  not_found: 404,
  conflict: 409,
  rate_limited: 429,
  server_error: 500,
};

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
  toResponse(): NextResponse {
    return fail(this.code, this.message, STATUS[this.code], this.details);
  }
}
