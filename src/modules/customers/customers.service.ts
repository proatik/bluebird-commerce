import { eq } from 'drizzle-orm';
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { customers } from '@/modules/database/schemas';
import { DatabaseService } from '@/modules/database/database.service';

import type { CustomerResponse } from '@/validation';
import type { NewCustomer } from '@/modules/database/schemas';

@Injectable()
export class CustomersService {
  constructor(private readonly database: DatabaseService) {}

  async create(input: NewCustomer): Promise<CustomerResponse> {
    const existing = await this.findByEmail(input.email);

    if (existing) {
      throw new ConflictException(`Email '${input.email}' is already registered.`);
    }

    const [customer] = await this.database.db
      .insert(customers)
      .values(input)
      .returning();

    return customer;
  }

  async findAll(): Promise<CustomerResponse[]> {
    return this.database.db.select().from(customers);
  }

  async findById(id: string): Promise<CustomerResponse> {
    const [customer] = await this.database.db
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1);

    if (!customer) {
      throw new NotFoundException(`Customer '${id}' not found.`);
    }

    return customer;
  }

  async findByEmail(email: string): Promise<CustomerResponse | undefined> {
    const [customer] = await this.database.db
      .select()
      .from(customers)
      .where(eq(customers.email, email))
      .limit(1);

    return customer;
  }
}
