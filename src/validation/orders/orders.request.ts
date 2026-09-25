import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createOrderSchema = z.object({
  customerId: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive()
      })
    )
    .min(1)
});

export class CreateOrderDto extends createZodDto(createOrderSchema) {}
