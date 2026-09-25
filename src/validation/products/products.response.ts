import { z } from 'zod';

export const productResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.number(),
  currency: z.string(),
  sku: z.string(),
  stock: z.number().int(),
  imageUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type ProductResponse = z.infer<typeof productResponseSchema>;

export const importErrorSchema = z.object({
  reason: z.string(),
  product: z.record(z.string(), z.unknown())
});

export const importProductsResponseSchema = z.object({
  imported: z.number().int(),
  skipped: z.number().int(),
  products: z.array(productResponseSchema),
  errors: z.array(importErrorSchema)
});

export type ImportProductsResponse = z.infer<typeof importProductsResponseSchema>;
