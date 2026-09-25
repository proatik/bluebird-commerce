import { sql } from 'drizzle-orm';
import { text, numeric, pgTable, timestamp } from 'drizzle-orm/pg-core';

import { customers } from '@/modules/database/schemas/customers.schema';

export const orders = pgTable('orders', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  customerId: text('customer_id')
    .notNull()
    .references(() => customers.id),
  status: text('status').notNull().default('pending'),
  total: numeric('total', { precision: 10, scale: 2, mode: 'number' })
    .notNull()
    .default(0),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow()
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
