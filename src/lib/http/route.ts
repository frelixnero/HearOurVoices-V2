// Thin wrapper that turns thrown ApiError / ZodError into standard responses so
// individual route handlers stay focused on logic (spec §45 coding rule 3 & 16).
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ApiError, fail, fromZodError } from './responses';

// Forwards any Next.js route context (e.g. `{ params }`) to the handler while
// centralizing error handling.
export function handle<Args extends unknown[]>(
  fn: (req: Request, ...args: Args) => Promise<NextResponse>,
): (req: Request, ...args: Args) => Promise<NextResponse> {
  return async (req: Request, ...args: Args) => {
    try {
      return await fn(req, ...args);
    } catch (err) {
      if (err instanceof ApiError) return err.toResponse();
      if (err instanceof ZodError) return fromZodError(err);
      console.error('Unhandled route error:', err);
      return fail('server_error', 'Something went wrong.', 500);
    }
  };
}

/** Extract a best-effort client IP for hashing (never stored raw). */
export function clientIp(req: Request): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() ?? null;
  return req.headers.get('x-real-ip');
}
