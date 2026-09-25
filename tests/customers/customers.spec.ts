import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { DatabaseService } from '@/modules/database/database.service';
import { CustomersService } from '@/modules/customers/customers.service';

import { uniqueSuffix, createTestDatabase } from '../helpers/test-database';

describe('CustomersService', () => {
  let database: DatabaseService;
  let customers: CustomersService;
  const suffix = uniqueSuffix();

  beforeAll(async () => {
    database = await createTestDatabase();
    customers = new CustomersService(database);
  });

  afterAll(async () => {
    await database.onModuleDestroy();
  });

  it('creates a customer and finds it by id and email', async () => {
    const email = `test-${suffix}@example.com`;
    const customer = await customers.create({ name: 'Test Customer', email });

    const byId = await customers.findById(customer.id);
    const byEmail = await customers.findByEmail(email);

    expect(byId.email).toBe(email);
    expect(byEmail?.id).toBe(customer.id);
  });

  it('rejects a duplicate email', async () => {
    const email = `dupe-${suffix}@example.com`;

    await customers.create({ name: 'First', email });

    await expect(
      customers.create({ name: 'Second', email })
    ).rejects.toThrow(/already registered/);
  });

  it('throws NotFoundException for an unknown id', async () => {
    await expect(customers.findById('does-not-exist')).rejects.toThrow(
      /not found/
    );
  });
});
