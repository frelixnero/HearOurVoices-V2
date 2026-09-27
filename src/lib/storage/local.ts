// Local filesystem storage driver — DEV/TEST ONLY (spec §31). Signs URLs with an
// HMAC derived from SESSION_SECRET + a TTL so the dev flow mirrors S3 signed URLs.
// Production swaps in an S3-compatible driver with the same interface.
import { createHash, createHmac } from 'node:crypto';
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import type { Bucket, PutResult, StorageDriver } from './driver';

function baseDir(): string {
  return resolve(process.env.STORAGE_LOCAL_DIR ?? './storage');
}
function secret(): string {
  return process.env.SESSION_SECRET ?? 'dev-insecure-secret';
}
function pathFor(bucket: Bucket, key: string): string {
  // Prevent path traversal — keys are opaque ids we generate.
  const safe = key.replace(/[^a-zA-Z0-9._/-]/g, '_');
  return join(baseDir(), bucket, safe);
}

export class LocalStorageDriver implements StorageDriver {
  async put(bucket: Bucket, key: string, data: Buffer): Promise<PutResult> {
    const p = pathFor(bucket, key);
    await mkdir(dirname(p), { recursive: true });
    await writeFile(p, data);
    return {
      key,
      hash: createHash('sha256').update(data).digest('hex'),
      size: data.length,
    };
  }

  async get(bucket: Bucket, key: string): Promise<Buffer> {
    return readFile(pathFor(bucket, key));
  }

  async exists(bucket: Bucket, key: string): Promise<boolean> {
    try {
      await access(pathFor(bucket, key));
      return true;
    } catch {
      return false;
    }
  }

  private sign(op: string, bucket: Bucket, key: string, expiresAt: number): string {
    const mac = createHmac('sha256', secret())
      .update(`${op}:${bucket}:${key}:${expiresAt}`)
      .digest('hex');
    const base = process.env.APP_BASE_URL ?? 'http://localhost:3000';
    return `${base}/api/storage/${op}?bucket=${bucket}&key=${encodeURIComponent(key)}&expires=${expiresAt}&sig=${mac}`;
  }

  async getSignedUploadUrl(bucket: Bucket, key: string, ttlSeconds = 300): Promise<string> {
    return this.sign('upload', bucket, key, Date.now() + ttlSeconds * 1000);
  }

  async getSignedDownloadUrl(bucket: Bucket, key: string, ttlSeconds = 300): Promise<string> {
    return this.sign('download', bucket, key, Date.now() + ttlSeconds * 1000);
  }

  /** Verify a signature produced by sign(). Used by the storage route. */
  static verify(
    op: string,
    bucket: string,
    key: string,
    expires: number,
    sig: string,
  ): boolean {
    if (Date.now() > expires) return false;
    const expected = createHmac('sha256', secret())
      .update(`${op}:${bucket}:${key}:${expires}`)
      .digest('hex');
    return expected === sig;
  }
}
