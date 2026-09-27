import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Integration tests run against a real embedded Postgres booted in globalSetup.
// Single fork so all tests share the one database server.
const TEST_DATABASE_URL = 'postgresql://hov:hov@localhost:55433/hovtest?schema=public';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests-integration/**/*.test.ts'],
    globalSetup: ['tests-integration/setup/global.ts'],
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
    testTimeout: 30_000,
    hookTimeout: 120_000,
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      SESSION_SECRET: 'test-secret-not-for-production-use-only',
      IP_HASH_PEPPER: 'test-pepper',
      STORAGE_DRIVER: 'local',
      STORAGE_LOCAL_DIR: './.storage-test',
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
