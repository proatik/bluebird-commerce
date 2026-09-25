import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

import * as schema from '@/modules/database/schemas';
import productsFixture from '../fixtures/products.json';
import customersFixture from '../fixtures/customers.json';

async function seed(): Promise<void> {
  const url =
    process.env.DATABASE_URL ??
    'postgres://bluebird:bluebird@localhost:5432/bluebird';
  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql, { schema });

  const insertedProducts = await db
    .insert(schema.products)
    .values(productsFixture)
    .onConflictDoNothing({ target: schema.products.sku })
    .returning();

  const insertedCustomers = await db
    .insert(schema.customers)
    .values(customersFixture)
    .onConflictDoNothing({ target: schema.customers.email })
    .returning();

  console.log(`seeded ${insertedProducts.length} products.`);
  console.log(`seeded ${insertedCustomers.length} customers.`);

  await sql.end();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
