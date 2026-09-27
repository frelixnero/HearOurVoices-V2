// Vitest globalSetup for integration tests. Boots a REAL Postgres (embedded, no
// Docker), resets the schema, and seeds roles. Test workers connect over TCP via
// DATABASE_URL (set in vitest.integration.config.ts). Teardown stops the server.
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import EmbeddedPostgres from 'embedded-postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

const PORT = 55433;
export const TEST_DATABASE_URL = `postgresql://hov:hov@localhost:${PORT}/hovtest?schema=public`;

let pg: EmbeddedPostgres | undefined;

export async function setup() {
  const fs = await import('node:fs');
  const dataDir = join(ROOT, '.pgdata-test');
  pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: 'hov',
    password: 'hov',
    port: PORT,
    persistent: true,
  });
  if (!fs.existsSync(join(dataDir, 'PG_VERSION'))) {
    await pg.initialise();
  }
  await pg.start();
  try {
    await pg.createDatabase('hovtest');
  } catch {
    /* exists */
  }

  // Reset + create the full schema from schema.prisma (fast, no migration files).
  execSync('npx prisma db push --force-reset --skip-generate --accept-data-loss', {
    cwd: ROOT,
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'inherit',
  });

  // Seed the 13 roles so RBAC lookups resolve.
  const { PrismaClient } = await import('@prisma/client');
  const { ROLES } = await import('../../src/lib/permissions/roles');
  const prisma = new PrismaClient({ datasourceUrl: TEST_DATABASE_URL });
  for (const name of ROLES) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} (test)` },
    });
  }
  await prisma.$disconnect();
}

export async function teardown() {
  if (pg) await pg.stop();
}
