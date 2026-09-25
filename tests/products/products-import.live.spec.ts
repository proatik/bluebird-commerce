import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';

const mockFetchUrl = vi.hoisted(() => vi.fn());

vi.mock('@/common/fetch-url', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/common/fetch-url')>();

  return { ...actual, fetchUrl: mockFetchUrl };
});

import { EnvService } from '@/modules/config/env.service';
import { DatabaseService } from '@/modules/database/database.service';
import { ProductsService } from '@/modules/products/products.service';
import { ProductsImportService } from '@/modules/products/products-import.service';

import { uniqueSuffix, createTestDatabase } from '../helpers/test-database';

const PRODUCT_PAGE_FIXTURE = `
<html>
<head><style>.price { color: red; }</style></head>
<body>
  <nav>Home | Shop | About | Cart (0)</nav>
  <script>trackPageView('shop');</script>
  <main>
    <div class="product">
      <h2>Aurora Desk Lamp __SUFFIX__</h2>
      <p class="price">$34.99</p>
      <p>SKU: LAMP-AURORA-__SUFFIX__</p>
      <p>In stock: 12 units</p>
    </div>
    <div class="product">
      <h2>Nimbus Travel Mug __SUFFIX__</h2>
      <p class="price">$18.50</p>
      <p>SKU: MUG-NIMBUS-__SUFFIX__</p>
      <p>In stock: 40 units</p>
    </div>
  </main>
  <footer>&copy; 2026 Example Shop. All rights reserved.</footer>
</body>
</html>
`;

const NON_PRODUCT_PAGE_FIXTURE = `
<html>
<body>
  <h1>About Us</h1>
  <p>We are a small team building tools for a better internet. Founded in 2020,
  our mission is to make software more delightful to use.</p>
</body>
</html>
`;

describe.skipIf(!process.env.OPENAI_API_KEY)('ProductsImportService (live)', () => {
  let database: DatabaseService;
  let products: ProductsService;
  let importService: ProductsImportService;
  const suffix = uniqueSuffix();
  const createdIds: string[] = [];

  beforeAll(async () => {
    database = await createTestDatabase();
    products = new ProductsService(database);

    const env = new EnvService({ get: (key: string) => process.env[key] } as never);

    importService = new ProductsImportService(env, products);
  });

  afterAll(async () => {
    for (const id of createdIds) {
      await products.remove(id).catch(() => undefined);
    }

    await database.onModuleDestroy();
  });

  it(
    'extracts real products from realistic, noisy HTML',
    async () => {
      mockFetchUrl.mockResolvedValueOnce(PRODUCT_PAGE_FIXTURE.replaceAll('__SUFFIX__', suffix));

      const result = await importService.importFromUrl('https://example.com/shop');

      expect(result.imported).toBeGreaterThanOrEqual(2);

      const skus = result.products.map((p) => p.sku);

      expect(skus).toContain(`LAMP-AURORA-${suffix}`);
      expect(skus).toContain(`MUG-NIMBUS-${suffix}`);

      createdIds.push(...result.products.map((p) => p.id));
    },
    30000
  );

  it(
    'imports nothing from a genuinely non-product page',
    async () => {
      mockFetchUrl.mockResolvedValueOnce(NON_PRODUCT_PAGE_FIXTURE);

      const result = await importService.importFromUrl('https://example.com/about');

      expect(result.imported).toBe(0);
      expect(result.products).toHaveLength(0);
    },
    30000
  );
});
