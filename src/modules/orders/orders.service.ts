import { eq } from 'drizzle-orm';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException
} from '@nestjs/common';

import { toCents, fromCents } from '@/common/money';
import { DatabaseService } from '@/modules/database/database.service';
import { orders, customers, products, orderItems } from '@/modules/database/schemas';

import type { OrderResponse } from '@/validation';

@Injectable()
export class OrdersService {
  constructor(private readonly database: DatabaseService) {}

  async create({
    customerId,
    items
  }: {
    customerId: string;
    items: Array<{ productId: string; quantity: number }>;
  }): Promise<OrderResponse> {
    if (items.length === 0) {
      throw new BadRequestException('An order needs at least one item.');
    }

    return this.database.db.transaction(async (tx) => {
      const [customer] = await tx
        .select()
        .from(customers)
        .where(eq(customers.id, customerId))
        .limit(1);

      if (!customer) {
        throw new NotFoundException(`Customer '${customerId}' not found.`);
      }

      let totalCents = 0;

      const itemInserts: Array<{
        productId: string;
        quantity: number;
        unitPrice: number;
      }> = [];

      for (const item of items) {
        const [product] = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (!product) {
          throw new NotFoundException(`Product '${item.productId}' not found.`);
        }

        if (product.stock < item.quantity) {
          throw new ConflictException(
            `Insufficient stock for '${product.name}': ${product.stock} available, ${item.quantity} requested.`
          );
        }

        await tx
          .update(products)
          .set({ stock: product.stock - item.quantity, updatedAt: new Date() })
          .where(eq(products.id, product.id));

        totalCents += toCents(product.price) * item.quantity;

        itemInserts.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price
        });
      }

      const [order] = await tx
        .insert(orders)
        .values({ customerId: customer.id, status: 'pending', total: fromCents(totalCents) })
        .returning();

      const insertedItems = await tx
        .insert(orderItems)
        .values(itemInserts.map((row) => ({ ...row, orderId: order.id })))
        .returning();

      return { ...order, items: insertedItems };
    });
  }

  async findAll(): Promise<OrderResponse[]> {
    return this.database.db.select().from(orders);
  }

  async findById(id: string): Promise<OrderResponse> {
    const [order] = await this.database.db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) {
      throw new NotFoundException(`Order '${id}' not found.`);
    }

    const items = await this.database.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    return { ...order, items };
  }

  async findByCustomerId(customerId: string): Promise<OrderResponse[]> {
    return this.database.db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId));
  }
}
