import { and, eq, lte, ilike } from 'drizzle-orm';
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { products } from '@/modules/database/schemas';
import { DatabaseService } from '@/modules/database/database.service';

import type { ProductResponse } from '@/validation';
import type { NewProduct } from '@/modules/database/schemas';

@Injectable()
export class ProductsService {
  constructor(private readonly database: DatabaseService) {}

  async create(input: NewProduct): Promise<ProductResponse> {
    const [existing] = await this.database.db
      .select()
      .from(products)
      .where(eq(products.sku, input.sku))
      .limit(1);

    if (existing) {
      throw new ConflictException(`SKU '${input.sku}' already exists.`);
    }

    const [product] = await this.database.db
      .insert(products)
      .values(input)
      .returning();

    return product;
  }

  async findAll(): Promise<ProductResponse[]> {
    return this.database.db.select().from(products);
  }

  async findById(id: string): Promise<ProductResponse> {
    const [product] = await this.database.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product) {
      throw new NotFoundException(`Product '${id}' not found.`);
    }

    return product;
  }

  async search(filters: {
    q?: string;
    category?: string;
    maxPrice?: number;
  }): Promise<ProductResponse[]> {
    const conditions = [];

    if (filters.q) {
      conditions.push(ilike(products.name, `%${filters.q}%`));
    }

    if (filters.category) {
      conditions.push(eq(products.category, filters.category));
    }

    if (filters.maxPrice !== undefined) {
      conditions.push(lte(products.price, filters.maxPrice));
    }

    const query = this.database.db.select().from(products);

    return conditions.length > 0 ? query.where(and(...conditions)) : query;
  }

  async update(id: string, input: Partial<NewProduct>): Promise<ProductResponse> {
    await this.findById(id);

    const [product] = await this.database.db
      .update(products)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();

    return product;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);

    await this.database.db.delete(products).where(eq(products.id, id));
  }

  async decrementStock(id: string, quantity: number): Promise<ProductResponse> {
    const product = await this.findById(id);

    if (product.stock < quantity) {
      throw new ConflictException(
        `Insufficient stock for '${product.name}': ${product.stock} available, ${quantity} requested.`
      );
    }

    const [updated] = await this.database.db
      .update(products)
      .set({ stock: product.stock - quantity, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();

    return updated;
  }
}
