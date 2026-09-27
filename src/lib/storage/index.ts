import type { StorageDriver } from './driver';
import { LocalStorageDriver } from './local';

let driver: StorageDriver | undefined;

// Returns the configured storage driver. `local` for dev/test; an S3 driver is
// wired here for staging/prod (same interface — spec §31).
export function storage(): StorageDriver {
  if (driver) return driver;
  const kind = process.env.STORAGE_DRIVER ?? 'local';
  switch (kind) {
    case 'local':
      driver = new LocalStorageDriver();
      return driver;
    case 's3': {
      // Lazy require so @aws-sdk stays optional unless S3 is actually selected.
      const { S3StorageDriver } = require('./s3') as typeof import('./s3');
      driver = new S3StorageDriver();
      return driver;
    }
    default:
      throw new Error(`Unknown STORAGE_DRIVER: ${kind}`);
  }
}

export type { StorageDriver, Bucket } from './driver';
export { LocalStorageDriver };
