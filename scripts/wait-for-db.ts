import 'dotenv/config';
import postgres from 'postgres';

const MAX_ATTEMPTS = 30;
const RETRY_DELAY_MS = 1000;

async function waitForDatabase(): Promise<void> {
  const url =
    process.env.DATABASE_URL ??
    'postgres://bluebird:bluebird@localhost:5432/bluebird';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const sql = postgres(url, { max: 1, connect_timeout: 2 });

    try {
      await sql`select 1`;

      await sql.end();

      console.log('database is ready.');

      return;
    } catch {
      await sql.end({ timeout: 1 });

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  throw new Error(`database did not become ready after ${MAX_ATTEMPTS} attempts.`);
}

waitForDatabase().catch((error) => {
  console.error(error);
  process.exit(1);
});
