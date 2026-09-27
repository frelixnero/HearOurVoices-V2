// Boots a real PostgreSQL instance in-process using embedded-postgres — no Docker,
// no admin install (spec §31 dev environment). For LOCAL DEV & CI only; production
// uses a managed Postgres via DATABASE_URL. Never store real evidence here (§31).
//
//   node scripts/embedded-pg.mjs           # boot & keep running on :55432
//   node scripts/embedded-pg.mjs --stop    # (handled by Ctrl-C)
//
// Connection string:
//   postgresql://hov:hov@localhost:55432/hearourvoices?schema=public
import EmbeddedPostgres from 'embedded-postgres';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const PG_PORT = 55432;
export const PG_USER = 'hov';
export const PG_PASSWORD = 'hov';
export const PG_DATABASE = 'hearourvoices';
export const DATABASE_URL = `postgresql://${PG_USER}:${PG_PASSWORD}@localhost:${PG_PORT}/${PG_DATABASE}?schema=public`;

export async function createInstance(dataDir = join(__dirname, '..', '.pgdata')) {
  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: PG_USER,
    password: PG_PASSWORD,
    port: PG_PORT,
    persistent: true,
  });
  return pg;
}

export async function boot(dataDir) {
  const pg = await createInstance(dataDir);
  const fs = await import('node:fs');
  const dir = dataDir ?? join(__dirname, '..', '.pgdata');
  if (!fs.existsSync(join(dir, 'PG_VERSION'))) {
    await pg.initialise();
  }
  await pg.start();
  try {
    await pg.createDatabase(PG_DATABASE);
  } catch {
    // already exists — fine
  }
  return pg;
}

// When run directly: boot and stay up until interrupted.
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('embedded-pg.mjs')) {
  const pg = await boot();
  console.log(`\nEmbedded Postgres ready:\n  ${DATABASE_URL}\n(Press Ctrl-C to stop)`);
  const stop = async () => {
    console.log('\nStopping embedded Postgres…');
    await pg.stop();
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}
