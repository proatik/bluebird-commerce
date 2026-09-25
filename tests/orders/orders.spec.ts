import { eq, inArray } from 'drizzle-orm';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { OrdersService } from '@/modules/orders/orders.service';
import { DatabaseService } from '@/modules/database/database.service';
import { ProductsService } from '@/modules/products/products.service';
import { CustomersService } from '@/modules/customers/customers.service';
import {
  orders as ordersTable,
  products as productsTable,
  customers as customersTable,
  orderItems as orderItemsTable
} from '@/modules/database/schemas';

import { uniqueSuffix, createTestDatabase } from '../helpers/test-database';

describe('OrdersService', () => {
  let database: DatabaseService;
  let orders: OrdersService;
  let products: ProductsService;
  let customers: CustomersService;
  const suffix = uniqueSuffix();

  let customerId: string;
  let inStockProductId: string;
  let lowStockProductId: string;

  beforeAll(async () => {
    database = await createTestDatabase();
    orders = new OrdersService(database);
    products = new ProductsService(database);
    customers = new CustomersService(database);

    const customer = await customers.create({
      name: 'Order Test Customer',
      email: `order-test-${suffix}@example.com`
    });
    customerId = customer.id;

    const inStock = await products.create({
      name: `Order Test Product ${suffix}`,
      price: 10,
      sku: `TEST-ORDER-${suffix}`,
      stock: 10
    });
    inStockProductId = inStock.id;

    const lowStock = await products.create({
      name: `Low Stock Product ${suffix}`,
      price: 5,
      sku: `TEST-ORDER-LOW-${suffix}`,
      stock: 1
    });
    lowStockProductId = lowStock.id;
  });

  afterAll(async () => {
    const customerOrders = await database.db
      .select({ id: ordersTable.id })
      .from(ordersTable)
      .where(eq(ordersTable.customerId, customerId));

    const orderIds = customerOrders.map((order) => order.id);

    if (orderIds.length > 0) {
      await database.db
        .delete(orderItemsTable)
        .where(inArray(orderItemsTable.orderId, orderIds));

      await database.db.delete(ordersTable).where(inArray(ordersTable.id, orderIds));
    }

    await database.db
      .delete(productsTable)
      .where(inArray(productsTable.id, [inStockProductId, lowStockProductId]));

    await database.db.delete(customersTable).where(eq(customersTable.id, customerId));

    await database.onModuleDestroy();
  });

  it('places an order, decrements stock, and computes the total', async () => {
    const order = await orders.create({
      customerId,
      items: [{ productId: inStockProductId, quantity: 3 }]
    });

    expect(order.total).toBe(30);
    expect(order.items).toHaveLength(1);

    const product = await products.findById(inStockProductId);

    expect(product.stock).toBe(7);
  });

  it('rejects an order for a nonexistent customer', async () => {
    await expect(
      orders.create({
        customerId: 'does-not-exist',
        items: [{ productId: inStockProductId, quantity: 1 }]
      })
    ).rejects.toThrow(/Customer/);
  });

  it('rejects an order for a nonexistent product', async () => {
    await expect(
      orders.create({
        customerId,
        items: [{ productId: 'does-not-exist', quantity: 1 }]
      })
    ).rejects.toThrow(/Product/);
  });

  it('rejects an order that exceeds available stock, and leaves stock unchanged', async () => {
    await expect(
      orders.create({
        customerId,
        items: [{ productId: lowStockProductId, quantity: 5 }]
      })
    ).rejects.toThrow(/Insufficient stock/);

    const product = await products.findById(lowStockProductId);

    expect(product.stock).toBe(1);
  });

  it('lists orders for a customer', async () => {
    const list = await orders.findByCustomerId(customerId);

    expect(list.length).toBeGreaterThan(0);
    expect(list.every((order) => order.customerId === customerId)).toBe(true);
  });
});
