import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { ProductsService } from '@/modules/products/products.service';
import { DatabaseService } from '@/modules/database/database.service';

import { uniqueSuffix, createTestDatabase } from '../helpers/test-database';

describe('ProductsService', () => {
  let database: DatabaseService;
  let products: ProductsService;
  const suffix = uniqueSuffix();
  const createdIds: string[] = [];

  beforeAll(async () => {
    database = await createTestDatabase();
    products = new ProductsService(database);
  });

  afterAll(async () => {
    for (const id of createdIds) {
      await products.remove(id).catch(() => undefined);
    }

    await database.onModuleDestroy();
  });

  it('creates a product and finds it by id', async () => {
    const product = await products.create({
      name: 'Test Widget',
      description: 'A widget for testing.',
      category: 'test',
      price: 5,
      sku: `TEST-WIDGET-${suffix}`,
      stock: 10
    });

    createdIds.push(product.id);

    const found = await products.findById(product.id);

    expect(found.name).toBe('Test Widget');
    expect(found.stock).toBe(10);
  });

  it('rejects a duplicate sku', async () => {
    const sku = `TEST-DUPE-${suffix}`;
    const product = await products.create({
      name: 'First',
      price: 1,
      sku,
      stock: 1
    });

    createdIds.push(product.id);

    await expect(
      products.create({ name: 'Second', price: 2, sku, stock: 1 })
    ).rejects.toThrow(/already exists/);
  });

  it('searches by name substring, case-insensitively', async () => {
    const product = await products.create({
      name: `Searchable Gadget ${suffix}`,
      price: 3,
      sku: `TEST-SEARCH-${suffix}`,
      stock: 5
    });

    createdIds.push(product.id);

    const results = await products.search({ q: 'searchable gadget' });

    expect(results.some((p) => p.id === product.id)).toBe(true);
  });

  it('filters search by maxPrice', async () => {
    const cheap = await products.create({
      name: `Cheap ${suffix}`,
      price: 1,
      sku: `TEST-CHEAP-${suffix}`,
      stock: 5
    });
    const expensive = await products.create({
      name: `Expensive ${suffix}`,
      price: 1000,
      sku: `TEST-EXPENSIVE-${suffix}`,
      stock: 5
    });

    createdIds.push(cheap.id, expensive.id);

    const results = await products.search({ maxPrice: 10 });
    const ids = results.map((p) => p.id);

    expect(ids).toContain(cheap.id);
    expect(ids).not.toContain(expensive.id);
  });

  it('decrements stock and rejects when insufficient', async () => {
    const product = await products.create({
      name: `Limited ${suffix}`,
      price: 1,
      sku: `TEST-LIMITED-${suffix}`,
      stock: 2
    });

    createdIds.push(product.id);

    const updated = await products.decrementStock(product.id, 1);

    expect(updated.stock).toBe(1);

    await expect(products.decrementStock(product.id, 5)).rejects.toThrow(
      /Insufficient stock/
    );
  });

  it('throws NotFoundException for an unknown id', async () => {
    await expect(products.findById('does-not-exist')).rejects.toThrow(
      /not found/
    );
  });
});
