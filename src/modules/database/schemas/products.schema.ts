import {
  text,
  numeric,
  varchar,
  integer,
  pgTable,
  timestamp
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const products = pgTable('products', {
  id: text('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  category: varchar('category', { length: 100 }).notNull().default('general'),
  price: numeric('price', { precision: 10, scale: 2, mode: 'number' }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  sku: varchar('sku', { length: 64 }).notNull().unique(),
  stock: integer('stock').notNull().default(0),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
