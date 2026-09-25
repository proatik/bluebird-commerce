import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';

const mockCreate = vi.fn();
const mockFetchUrl = vi.hoisted(() => vi.fn());

vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(function OpenAIMock() {
    return { chat: { completions: { create: mockCreate } } };
  })
}));

vi.mock('@/common/fetch-url', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/common/fetch-url')>();

  return { ...actual, fetchUrl: mockFetchUrl };
});

import { importProductsSchema } from '@/validation';
import { EnvService } from '@/modules/config/env.service';
import { DatabaseService } from '@/modules/database/database.service';
import { ProductsService } from '@/modules/products/products.service';
import { ProductsImportService } from '@/modules/products/products-import.service';

import { uniqueSuffix, createTestDatabase } from '../helpers/test-database';

function extractionResponse(products: unknown[]) {
  return { choices: [{ message: { content: JSON.stringify({ products }) } }] };
}

function blankCandidate(overrides: Record<string, unknown>) {
  return {
    name: null,
    description: null,
    category: null,
    price: null,
    currency: null,
    sku: null,
    stock: null,
    imageUrl: null,
    ...overrides
  };
}

describe('ProductsImportService', () => {
  let database: DatabaseService;
  let products: ProductsService;
  let importService: ProductsImportService;
  const suffix = uniqueSuffix();
  const createdIds: string[] = [];

  beforeAll(async () => {
    database = await createTestDatabase();
    products = new ProductsService(database);
    importService = new ProductsImportService(
      new EnvService({ get: () => 'test-key' } as never),
      products
    );
  });

  afterAll(async () => {
    for (const id of createdIds) {
      await products.remove(id).catch(() => undefined);
    }

    await database.onModuleDestroy();
  });

  it('imports a valid candidate and reports an invalid one without aborting the batch', async () => {
    mockFetchUrl.mockResolvedValueOnce('<html><body>irrelevant, extraction is mocked</body></html>');
    mockCreate.mockResolvedValueOnce(
      extractionResponse([
        blankCandidate({
          name: `Import Widget ${suffix}`,
          price: 9.99,
          sku: `TEST-IMPORT-${suffix}`,
          stock: 5
        }),
        blankCandidate({})
      ])
    );

    const result = await importService.importFromUrl('https://example.com/products');

    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.products[0].sku).toBe(`TEST-IMPORT-${suffix}`);
    expect(result.errors[0].reason).toBeTruthy();

    createdIds.push(result.products[0].id);
  });

  it('returns zero results for a non-product page', async () => {
    mockFetchUrl.mockResolvedValueOnce('<html><body>About our company...</body></html>');
    mockCreate.mockResolvedValueOnce(extractionResponse([]));

    const result = await importService.importFromUrl('https://example.com/about');

    expect(result).toEqual({ imported: 0, skipped: 0, products: [], errors: [] });
  });

  it('skips a duplicate sku without aborting the batch', async () => {
    const existing = await products.create({
      name: `Existing Product ${suffix}`,
      price: 4,
      sku: `TEST-EXISTING-${suffix}`,
      stock: 3
    });

    createdIds.push(existing.id);

    mockFetchUrl.mockResolvedValueOnce('<html></html>');
    mockCreate.mockResolvedValueOnce(
      extractionResponse([
        blankCandidate({ name: 'Duplicate', price: 4, sku: `TEST-EXISTING-${suffix}`, stock: 1 }),
        blankCandidate({ name: `Novel Product ${suffix}`, price: 4, sku: `TEST-NOVEL-${suffix}`, stock: 1 })
      ])
    );

    const result = await importService.importFromUrl('https://example.com/dupe');

    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.errors[0].reason).toMatch(/already exists/);

    createdIds.push(result.products[0].id);
  });

  it('rejects a private/loopback URL before attempting any fetch', async () => {
    mockFetchUrl.mockClear();

    await expect(importService.importFromUrl('http://127.0.0.1/products')).rejects.toThrow(
      /private|local/
    );
    await expect(importService.importFromUrl('http://localhost/products')).rejects.toThrow(
      /private|local/
    );

    expect(mockFetchUrl).not.toHaveBeenCalled();
  });

  it('propagates a genuine fetch failure instead of returning a fake success', async () => {
    mockFetchUrl.mockRejectedValueOnce(new Error('getaddrinfo ENOTFOUND'));

    await expect(importService.importFromUrl('https://does-not-resolve.example/x')).rejects.toThrow(
      /ENOTFOUND/
    );
  });

  it('rejects a malformed URL at the request schema boundary', () => {
    const result = importProductsSchema.safeParse({ url: 'not-a-url' });

    expect(result.success).toBe(false);
  });
});
