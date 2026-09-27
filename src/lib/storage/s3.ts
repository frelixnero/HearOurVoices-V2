// S3-compatible storage driver (spec §31, §32). Finished at the seam: it uses the
// AWS SDK v3, dynamically imported so the app never requires the dependency unless
// STORAGE_DRIVER=s3. Separate ORIGINALS vs PUBLIC buckets keep restricted content
// off the public path (§14.4). Presigned URLs give time-limited access (§32).
import { createHash } from 'node:crypto';
import type { Bucket, PutResult, StorageDriver } from './driver';

function bucketName(bucket: Bucket): string {
  const name = bucket === 'originals' ? process.env.S3_BUCKET_ORIGINALS : process.env.S3_BUCKET_PUBLIC;
  if (!name) throw new Error(`Missing S3 bucket env for "${bucket}".`);
  return name;
}

// Lazy import keeps @aws-sdk optional. Install @aws-sdk/client-s3 and
// @aws-sdk/s3-request-presigner to enable this driver in production.
async function sdk() {
  try {
    // webpackIgnore keeps these out of the bundle so the app builds without the
    // AWS SDK installed; they load at runtime only when STORAGE_DRIVER=s3.
    const client = await import(/* webpackIgnore: true */ '@aws-sdk/client-s3' as string);
    const presign = await import(/* webpackIgnore: true */ '@aws-sdk/s3-request-presigner' as string);
    return { client, presign };
  } catch {
    throw new Error(
      'S3 driver needs @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner. ' +
        'Install them, or use STORAGE_DRIVER=local for development.',
    );
  }
}

export class S3StorageDriver implements StorageDriver {
  private async makeClient() {
    const { client } = await sdk();
    const S3Client = (client as { S3Client: new (cfg: unknown) => unknown }).S3Client;
    return new S3Client({
      region: process.env.S3_REGION,
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
      },
    });
  }

  async put(bucket: Bucket, key: string, data: Buffer): Promise<PutResult> {
    const { client } = await sdk();
    const c = await this.makeClient();
    const PutObjectCommand = (client as { PutObjectCommand: new (i: unknown) => unknown }).PutObjectCommand;
    await (c as { send: (cmd: unknown) => Promise<unknown> }).send(
      new PutObjectCommand({ Bucket: bucketName(bucket), Key: key, Body: data }),
    );
    return { key, hash: createHash('sha256').update(data).digest('hex'), size: data.length };
  }

  async get(bucket: Bucket, key: string): Promise<Buffer> {
    const { client } = await sdk();
    const c = await this.makeClient();
    const GetObjectCommand = (client as { GetObjectCommand: new (i: unknown) => unknown }).GetObjectCommand;
    const res = (await (c as { send: (cmd: unknown) => Promise<{ Body: { transformToByteArray: () => Promise<Uint8Array> } }> }).send(
      new GetObjectCommand({ Bucket: bucketName(bucket), Key: key }),
    ));
    return Buffer.from(await res.Body.transformToByteArray());
  }

  async exists(bucket: Bucket, key: string): Promise<boolean> {
    try {
      await this.get(bucket, key);
      return true;
    } catch {
      return false;
    }
  }

  private async presign(op: 'put' | 'get', bucket: Bucket, key: string, ttl: number): Promise<string> {
    const { client, presign } = await sdk();
    const c = await this.makeClient();
    const Cmd = op === 'put'
      ? (client as { PutObjectCommand: new (i: unknown) => unknown }).PutObjectCommand
      : (client as { GetObjectCommand: new (i: unknown) => unknown }).GetObjectCommand;
    const getSignedUrl = (presign as { getSignedUrl: (c: unknown, cmd: unknown, o: unknown) => Promise<string> }).getSignedUrl;
    return getSignedUrl(c, new Cmd({ Bucket: bucketName(bucket), Key: key }), { expiresIn: ttl });
  }

  getSignedUploadUrl(bucket: Bucket, key: string, ttlSeconds = 300): Promise<string> {
    return this.presign('put', bucket, key, ttlSeconds);
  }
  getSignedDownloadUrl(bucket: Bucket, key: string, ttlSeconds = 300): Promise<string> {
    return this.presign('get', bucket, key, ttlSeconds);
  }
}
