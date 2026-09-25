import { sql } from 'drizzle-orm';
import { text, numeric, integer, pgTable } from 'drizzle-orm/pg-core';

import { orders } from '@/modules/database/schemas/orders.schema';
import { products } from '@/modules/database/schemas/products.schema';

export const orderItems = pgTable('order_items', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  orderId: text('order_id')
    .notNull()
    .references(() => orders.id),
  productId: text('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2, mode: 'number' }).notNull()
});

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
