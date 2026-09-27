import { NextResponse } from 'next/server';
import { storage, LocalStorageDriver, type Bucket } from '@/lib/storage';
import { fail } from '@/lib/http/responses';

export const dynamic = 'force-dynamic';

// Serves/accepts evidence bytes ONLY with a valid, unexpired HMAC signature
// issued by the storage driver (§32 signed URLs). This is how a signed download
// URL from resolveEvidenceAccess is fulfilled.
function parse(req: Request, op: string) {
  const url = new URL(req.url);
  const bucket = url.searchParams.get('bucket') as Bucket | null;
  const key = url.searchParams.get('key');
  const expires = Number(url.searchParams.get('expires'));
  const sig = url.searchParams.get('sig') ?? '';
  if (!bucket || !key || !expires || !sig) return null;
  if (!LocalStorageDriver.verify(op, bucket, key, expires, sig)) return null;
  return { bucket, key };
}

export async function GET(req: Request, ctx: { params: { op: string } }) {
  if (ctx.params.op !== 'download') return fail('not_found', 'Not found.', 404);
  const parsed = parse(req, 'download');
  if (!parsed) return fail('permission_denied', 'Invalid or expired link.', 403);
  try {
    const bytes = await storage().get(parsed.bucket, parsed.key);
    return new NextResponse(new Uint8Array(bytes), {
      headers: { 'Content-Type': 'application/octet-stream', 'Cache-Control': 'private, no-store' },
    });
  } catch {
    return fail('not_found', 'File not found.', 404);
  }
}

export async function PUT(req: Request, ctx: { params: { op: string } }) {
  if (ctx.params.op !== 'upload') return fail('not_found', 'Not found.', 404);
  const parsed = parse(req, 'upload');
  if (!parsed) return fail('permission_denied', 'Invalid or expired link.', 403);
  const buf = Buffer.from(await req.arrayBuffer());
  await storage().put(parsed.bucket, parsed.key, buf);
  return NextResponse.json({ ok: true, data: { stored: true } }, { status: 201 });
}
