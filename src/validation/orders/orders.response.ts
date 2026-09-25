import { z } from 'zod';

export const orderItemResponseSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  productId: z.string(),
  quantity: z.number().int(),
  unitPrice: z.number()
});

export const orderResponseSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  status: z.string(),
  total: z.number(),
  createdAt: z.date(),
  items: z.array(orderItemResponseSchema).optional()
});

export type OrderItemResponse = z.infer<typeof orderItemResponseSchema>;
export type OrderResponse = z.infer<typeof orderResponseSchema>;
