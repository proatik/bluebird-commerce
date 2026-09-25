import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  category: z.string().default('general'),
  price: z.number().positive().multipleOf(0.01),
  currency: z.string().length(3).default('USD'),
  sku: z.string().min(1),
  stock: z.number().int().min(0).default(0),
  imageUrl: z.url().optional()
});

export const updateProductSchema = createProductSchema.partial();

export const searchProductsSchema = z.object({
  q: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  maxPrice: z.coerce.number().positive().optional()
});

export class CreateProductDto extends createZodDto(createProductSchema) {}

export class UpdateProductDto extends createZodDto(updateProductSchema) {}

export class SearchProductsDto extends createZodDto(searchProductsSchema) {}
