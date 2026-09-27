// Storage abstraction for evidence files (spec §14, §31 pipeline, §32 signed URLs).
// Two logical buckets keep the restricted ORIGINAL apart from the PUBLIC redacted
// copy (§14.4, §32 data separation).
export type Bucket = 'originals' | 'public';

export interface PutResult {
  key: string;
  hash: string; // sha-256 of stored bytes (chain-of-custody integrity, §14.3)
  size: number;
}

export interface StorageDriver {
  /** Store bytes; returns the storage key + content hash. */
  put(bucket: Bucket, key: string, data: Buffer): Promise<PutResult>;
  /** Read bytes back (server-side; access must already be authorized). */
  get(bucket: Bucket, key: string): Promise<Buffer>;
  /** Time-limited signed URL for direct client upload (§32). */
  getSignedUploadUrl(bucket: Bucket, key: string, ttlSeconds?: number): Promise<string>;
  /** Time-limited signed URL for download (§32). */
  getSignedDownloadUrl(bucket: Bucket, key: string, ttlSeconds?: number): Promise<string>;
  exists(bucket: Bucket, key: string): Promise<boolean>;
}
